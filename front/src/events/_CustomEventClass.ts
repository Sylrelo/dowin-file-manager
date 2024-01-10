import type { Subscriber } from "svelte/motion";
import { writable, type Updater, type Writable, get } from "svelte/store";

class CustomEventClass<T, U = null> {
    private store: Writable<T>;
    private optionnalData: U;

    constructor() {
        this.store = writable<T>();
        this.optionnalData = null as U;
        console.log("CustomEventClass init.")
    }

    public subscribe(run: Subscriber<T>) {
        return this.store.subscribe(run);
    }

    public update(updater: Updater<T>) {
        this.store.update(updater)
    }

    public get data(): U {
        return this.optionnalData;
    }

    public set data(data: U) {
        this.optionnalData = data;
    }

    public get value(): T {
        return get(this.store);
    }

    public set value(v: T) {
        this.store.set(v);
    }
}

export default CustomEventClass;