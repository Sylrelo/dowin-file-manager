import { Http } from "../http";
import { getNameBeforeLastSlash } from "../utils";
import { JobQueue, type Job } from "./JobQueue";

interface UploadJob extends Job {
    dst: string
    file: File

    progressPerChunk?: number[]
    progress?: number

    speed?: number
    _lastReportTime?: number
}

interface ChunkInfos {
    chunkSize: number,
    chunkCount: number,
}

class UploadQueue extends JobQueue<UploadJob> {

    private MAX_CONCURRENT_CHUNK: number = 1;

    constructor() {
        super(4)
        this.name = "Upload Queue";
    }

    public addUpload(dst: string, file: File): void {
        console.log("Adding ", file.name, dst)
        this.add({
            dst,
            file,
        })
    }

    protected async execute(job: UploadJob, updateFn: (value: Partial<UploadJob>) => void): Promise<void> {
        const chunkInfo = this.getChunkInfos(job);
        let progressPerChunks = new Array(chunkInfo.chunkCount);
        updateFn({ progressPerChunk: progressPerChunks });

        await this.uploadFile(job, chunkInfo, updateFn);
    }

    private onUploadProgress(
        job: UploadJob,
        chunkId: number,
        uploaded: number,
        currentChunkSize: number,
        updateFn: (value: Partial<UploadJob>) => void
    ): void {
        const currPercent = ((uploaded / currentChunkSize) * 100);
        const progressPerChunk = job.progressPerChunk!;
        progressPerChunk[chunkId] = Math.min(currPercent, 100);

        const totalProgress = progressPerChunk.reduce((prev, curr) => prev + curr, 0) / progressPerChunk.length;

        const lastBytes = job.file.size * (job.progress! / 100);
        const nowBytes = job.file.size * (totalProgress / 100);
        const timeSinceLastReport = Date.now() - (job._lastReportTime ?? 0);
        const diff = nowBytes - lastBytes;
        const estimatedSpeed = (diff) * (1000 / timeSinceLastReport) / 8;

        updateFn({
            progressPerChunk,
            progress: totalProgress,
            _lastReportTime: Date.now(),
            speed: estimatedSpeed,
        })
    }

    private getChunkInfos(job: UploadJob) {
        const CHUNK_SIZE = 1024 * 1024 * 80;
        const totalChunks = Math.ceil(job.file.size / CHUNK_SIZE);

        return {
            chunkSize: CHUNK_SIZE,
            chunkCount: totalChunks,
        }
    }

    private async uploadFile(
        job: UploadJob,
        chunkInfo: ChunkInfos,
        updateFn: (value: Partial<UploadJob>) => void
    ): Promise<void> {
        let start = 0;
        let chunkId = 0;

        let chunkQueue: Promise<void>[] = [];

        let timeStart = Date.now();

        while (start < job.file.size) {
            const chunkEnd = Math.min(start + chunkInfo.chunkSize, job.file.size);
            const currentChunkSize = chunkEnd - start;
            const chunk = job.file.slice(start, chunkEnd);

            chunkQueue.push(this.uploadChunk(job, start, chunk, currentChunkSize, chunkId, updateFn))

            if (chunkQueue.length >= this.MAX_CONCURRENT_CHUNK) {
                await Promise.all(chunkQueue);
                chunkQueue = []
            }

            chunkId++;
            start += chunkInfo.chunkSize;
        }

        //progressPerChunks[chunkId] = percentage;
        let timeEnd = Date.now();
        console.log("Taken ", timeEnd - timeStart);
    }

    private async uploadChunk(
        job: UploadJob,
        start: number,
        chunk: Blob,
        currentChunkSize: number,
        chunkId: number,
        updateFn: (value: Partial<UploadJob>) => void
    ): Promise<void> {
        try {
            await Http.upload_file_xhr(
                job.dst,
                job.file.name,
                start,
                chunk,
                (uploaded) => {
                    this.onUploadProgress(job, chunkId, uploaded, currentChunkSize, updateFn);
                }
            );
        } catch (error) {
            console.error("Error , TODO HANDLING ", error)
        }
    }

    public get asJobProgress(): any[] {
        return this.running.map(job => ({
            title: getNameBeforeLastSlash(job.file.name),
            subtitle: job.dst,
            progress: Math.round(job.progress ?? 0),
            speed: job.speed ?? -1,
            type: "UP",
            id: job._id
        }))
    }
}

export const uploadJobQueue = new UploadQueue();