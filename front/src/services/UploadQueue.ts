import { get } from "svelte/store";
import { Http } from "../http";
import { explorerWindowRefresh, globalSettings } from "../stores/global";
import { getNameBeforeLastSlash, sleep } from "../utils";
import { JobQueue, type Job } from "./JobQueue";

interface UploadJob extends Job {
    dst: string
    file: File

    progressPerChunk?: number[]
    progress?: number

    speed?: number
    _lastReportTime?: number

    windowUuid: string

    supInfos?: string

    _cancelled?: boolean
}

interface ChunkInfos {
    chunkSize: number,
    chunkCount: number,
}

class UploadQueue extends JobQueue<UploadJob> {

    private MAX_CONCURRENT_CHUNK: number = + get(globalSettings).uploadSettings.maxConcurrentChunks;
    private MAX_CHUNK_SIZE: number = +get(globalSettings).uploadSettings.maxChunkSize;

    constructor() {
        super(+get(globalSettings).uploadSettings.maxConcurrentFileUpload)
        this.name = "Upload Queue";
    }

    public addUpload(windowUuid: string, dst: string, file: File): void {
        console.log("Adding ", file.name, dst)
        this.add({
            dst,
            file,
            windowUuid
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
        const CHUNK_SIZE = 1000 * 1000 * this.MAX_CHUNK_SIZE;
        const totalChunks = Math.ceil(job.file.size / CHUNK_SIZE);

        console.log(this.MAX_CHUNK_SIZE, totalChunks, this.MAX_CONCURRENT_CHUNK);

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

        let multichunkConfig = {
            min: 99999,
            max: chunkInfo.chunkCount
        };

        while (start < job.file.size) {
            if (job._cancelled === true) {
                break;
            }

            const chunkEnd = Math.min(start + chunkInfo.chunkSize, job.file.size);
            const currentChunkSize = chunkEnd - start;
            const chunk = job.file.slice(start, chunkEnd);

            multichunkConfig.min = Math.min(chunkId, multichunkConfig.min);
            chunkQueue.push(
                this.uploadChunk(
                    job,
                    start,
                    chunk,
                    currentChunkSize,
                    chunkId,
                    this.MAX_CONCURRENT_CHUNK > 1 ? multichunkConfig : undefined,
                    updateFn
                )
            )

            if (chunkQueue.length >= this.MAX_CONCURRENT_CHUNK) {
                const promises = Promise.all(chunkQueue);
                await promises;
                await sleep(10)
                multichunkConfig.min = 99999;
                chunkQueue = []
            }

            chunkId++;
            start += chunkInfo.chunkSize;
        }
        let timeEnd = Date.now();
        console.log("Taken ", timeEnd - timeStart);

        updateFn({
            speed: -1,
            supInfos: this.MAX_CONCURRENT_CHUNK > 1 ? "Finalizing merge : " : undefined
        })

        await sleep(1000 + 100 * chunkInfo.chunkCount);
        explorerWindowRefresh.set([job.windowUuid, Date.now()]);
    }

    private async uploadChunk(
        job: UploadJob,
        start: number,
        chunk: Blob,
        currentChunkSize: number,
        chunkId: number,
        multichunkConfig: any,
        updateFn: (value: Partial<UploadJob>) => void
    ): Promise<void> {
        try {
            await Http.upload_file_xhr(
                chunk,
                job.dst,
                {
                    filename: job.file.name,
                    offset: start,
                    chunkId: chunkId,
                    chunkRangeMin: multichunkConfig?.min,
                    chunkRangeMax: Math.min(multichunkConfig?.max, multichunkConfig?.min + this.MAX_CONCURRENT_CHUNK),
                },
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
            title: (job.supInfos ?? "") + getNameBeforeLastSlash(job.file.name),
            subtitle: job.dst,
            progress: Math.round(job.progress ?? 0),
            speed: job.speed ?? -1,
            type: "UP",
            id: job._id,
            abort: () => {
                job._cancelled = true;
            }
        }))
    }
}

// export const uploadJobQueueInitializer = { uploadJobQueue: undefined };
export let uploadJobQueue: UploadQueue;

export function initUploadQueue() {
    console.log("HELLO");
    uploadJobQueue = new UploadQueue();
}