import { get } from "svelte/store";
import { Http } from "../http";
import { explorerWindowRefresh, globalSettings } from "../stores/global";
import { getNameBeforeLastSlash, sleep } from "../utils";
import { JobQueue, type Job } from "./JobQueue";

interface UploadJob extends Job {
    windowUuid: string
    _cancelled?: boolean

    dst: string
    file: File

    completedPercentage: number
    uploadedBytes: number
    speed?: number

    supInfos?: string

    chunksLeft: number[]
    chunkCurrentCount: number
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
            windowUuid,
            chunksLeft: [],
            chunkCurrentCount: 0,
            uploadedBytes: 0,
            completedPercentage: 0,
        })
    }

    protected async execute(job: UploadJob, updateFn: (value: Partial<UploadJob>) => void): Promise<void> {
        const chunkInfo = this.getChunkInfos(job);
        let progressPerChunks = new Array(chunkInfo.chunkCount).fill(0);

        updateFn({ progressPerChunk: progressPerChunks });

        const chunksLeft: number[] = (new Array(chunkInfo.chunkCount)).fill(0).map((_, i) => i).reverse();
        job.chunksLeft = chunksLeft;

        this.dispatchChunks(job, chunkInfo, updateFn);

        const START = Date.now();
        await new Promise((resolve) => {
            let interval: any = null;
            let oldUploadedBytes = 0;

            interval = setInterval(() => {
                updateFn({
                    speed: (job.uploadedBytes - oldUploadedBytes) / 8,
                })
                oldUploadedBytes = job.uploadedBytes;
                if (
                    (job.chunksLeft.length === 0 && job.chunkCurrentCount === 0) ||
                    job._cancelled === true
                ) {
                    clearInterval(interval);
                    resolve(undefined);
                }
            }, 1000)
        });
        await sleep(1000);
        explorerWindowRefresh.set([job.windowUuid, Date.now()]);

        console.log("Took", Date.now() - START - 2000, "ms")
    }

    private async dispatchChunks(
        job: UploadJob,
        chunkInfo: ChunkInfos,
        updateFn: (value: Partial<UploadJob>) => void
    ) {
        const freeSlot = this.MAX_CONCURRENT_CHUNK - job.chunkCurrentCount;

        if (freeSlot <= 0 || job.chunksLeft.length === 0) return;

        for (let i = 0; i < freeSlot; i++) {
            if (job._cancelled === true)
                return;
            this.chunkUpload(job, chunkInfo, updateFn)
        }
    }

    private async chunkUpload(
        job: UploadJob,
        chunkInfo: ChunkInfos,
        updateFn: (value: Partial<UploadJob>) => void
    ) {
        const current = job.chunksLeft.pop();
        if (current == null) return;

        job.chunkCurrentCount++;

        const offsetStart = Math.min(current * chunkInfo.chunkSize, job.file.size);
        const offsetEnd = Math.min((current + 1) * chunkInfo.chunkSize, job.file.size);
        const chunk = job.file.slice(offsetStart, offsetEnd);

        let oldUploaded = 0;

        await Http.upload_file_xhr(
            chunk,
            job.dst,
            {
                filename: job.file.name,
                offset: offsetStart,
                chunkId: current,
            },
            (uploaded) => {
                const current = uploaded - oldUploaded;
                job.uploadedBytes += current;

                if (job.speed == undefined)
                    updateFn({ speed: current })

                updateFn({
                    completedPercentage: Math.min(100, (job.uploadedBytes / job.file.size) * 100)
                })
                oldUploaded = uploaded;
            }
        );

        job.chunkCurrentCount--;
        this.dispatchChunks(job, chunkInfo, updateFn);
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

    public get asJobProgress(): any[] {
        return this.running.map(job => ({
            title: (job.supInfos ?? "") + getNameBeforeLastSlash(job.file.name),
            subtitle: job.dst,
            progress: Math.floor(job.completedPercentage),
            speed: job.speed ?? 0,
            type: "UP",
            id: job._id,
            abort: () => {
                job._cancelled = true;
            }
        }))
    }
}

export let uploadJobQueue: UploadQueue;

export function initUploadQueue() {
    uploadJobQueue = new UploadQueue();
}