import { get, writable, type Subscriber, type Writable } from "svelte/store";
import { sleep } from "../utils";
import { v4 as uuidv4 } from "uuid";

export interface Job {
    [key: string]: any

    startedAt?: number
    endedAt?: number

    _id?: string
}

// ==========================================================================

export class JobQueue<T extends Job> {

    #store: Writable<T[]>;
    #concurrentMax: number = 1;
    #name: string = "";

    public constructor(concurrentMax: number) {
        this.#store = writable<T[]>([])
        this.#concurrentMax = concurrentMax;
    }

    /**
     * Svelte store subscriber
     */
    public subscribe(runner: Subscriber<T[]>) {
        return this.#store.subscribe(runner);
    }

    // ==================================

    protected set name(v: string) {
        this.#name = v;
    }

    // ==================================

    public async run(): Promise<void> {
        if (this.running.length >= this.#concurrentMax) {
            return;
        }

        if (this.done.length == get(this.#store).length) {
            this.log("Everything is done. Cleaning list.")
            this.#store.set([]);
            return;
        }

        if (this.pending.length === 0) {
            // this.log("No more jobs available.");
            return;
        }

        const currentJob = this.nextPending;

        this.log("New job started.")
        this.update(currentJob.id, { startedAt: Date.now() } as T);

        await this.execute(
            currentJob.job,
            (value: Partial<T>) => {
                this.update(currentJob.id, value)
            }

        );

        this.update(currentJob.id, { endedAt: Date.now() } as T)
    }

    // ==================================

    public add(job: T): void {
        this.log("New job added.")
        this.#store.update(old => ([...old, { ...job, _id: uuidv4() }]));
    }

    // ==================================

    public get pending(): T[] {
        const jobs = get(this.#store);

        return jobs.filter(j => null == j.endedAt && null == j.startedAt);
    }

    public get done(): T[] {
        const jobs = get(this.#store);

        return jobs.filter(j => null != j.endedAt && null != j.startedAt);
    }

    public get running(): T[] {
        const jobs = get(this.#store);

        return jobs.filter(j => null == j.endedAt && null != j.startedAt);
    }

    // ==================================

    protected update(id: number, value: Partial<T>) {
        this.#store.update(old => {
            for (const key in value) {
                //@ts-ignore
                old[id][key] = value[key];
            }
            return old;
        })
    }

    protected clear() {
        this.#store.update(() => ([]));
    }

    /** 
     * Method to override that contain all Job handling logic.
     */
    protected async execute(_currentJob: T, _updateFn: (value: Partial<T>) => void): Promise<void> {
        console.error("No executor specified.");
    }

    // ==================================

    private get nextPending(): { id: number, job: T } {
        const jobs = get(this.#store);

        const id = jobs.findIndex(j => null == j.endedAt && null == j.startedAt);

        return {
            id,
            job: jobs[id]
        };
    }

    private log(msg: string) {
        console.debug(`%c[${this.#name}] [${Date.now()}] ${msg}`, 'color: yellow;')
    }
}
