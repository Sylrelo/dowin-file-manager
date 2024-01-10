import { Http } from "../http";
import { explorerWindowRefresh } from "../stores/global";
import type { SelectedFile } from "../stores/pathSelection";
import { getNameBeforeLastSlash, sleep } from "../utils";
import { JobQueue, type Job } from "./JobQueue";

export type FsJobType = "CP" | "MV"

interface FsJob extends Job {
    src: string
    dst: string
    type: FsJobType

    progress?: number
    speed?: number

    job_id?: string

    windowUuid: string,
}

class FsQueue extends JobQueue<FsJob> {
    constructor() {
        super(1)
        this.name = "Upload Queue";
    }

    public addMultiple(windowUuid: string, type: FsJobType, srcs: SelectedFile[], dst: string): void {
        for (const src of srcs) {
            this.add({
                src: src.path,
                dst,
                type,
                windowUuid,
            })
        }
    }

    protected async execute(currentJob: FsJob, updateFn: (value: Partial<FsJob>) => void): Promise<void> {
        try {


            const res = await Http.post("fs/" + currentJob.type.toLowerCase(), {
                src: currentJob.src,
                dst: currentJob.dst,
            });

            updateFn({
                job_id: res.uuid,
            });

            let progressResponse: any = {
                writtenBytes: 0,
                totalBytes: 1
            };
            let oldWrittenBytes = 0;

            while (progressResponse.writtenBytes < progressResponse.totalBytes) {
                try {
                    progressResponse = await Http.get("fs/progress/" + res.uuid);

                    const speed = (progressResponse.writtenBytes - oldWrittenBytes) / 8;
                    oldWrittenBytes = progressResponse.writtenBytes;
                    updateFn({
                        progress: Math.round(progressResponse.writtenBytes / progressResponse.totalBytes * 100),
                        speed
                    } as FsJob)

                    await sleep(1000);
                } catch (err: any) {
                    //TODO: Better error handling.
                    console.error(err.response)
                    break;
                }
            }

            updateFn({
                progress: 100,
                speed: 0
            } as FsJob)

            await sleep(500);

            explorerWindowRefresh.set([currentJob.windowUuid, Date.now()]);

        } catch (err) {
            console.error(err)
        }
    }

    public get asJobProgress(): any[] {
        return this.running.map(job => ({
            title: getNameBeforeLastSlash(job.src),
            subtitle: getNameBeforeLastSlash(job.dst),
            progress: Math.round(job.progress ?? 0),
            speed: job.speed ?? -1,
            type: job.type,
            id: job._id,
            job_id: job.job_id
        }))
    }

}

export const fsJobQueue = new FsQueue();