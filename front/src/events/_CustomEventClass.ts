import type { Subscriber } from "svelte/motion";
import { writable, type Updater, type Writable, get } from "svelte/store";

class CustomEventClass<T> {
    private store: Writable<T>;

    constructor() {
        this.store = writable<T>();
        console.log("CustomEventClass init.")
    }

    public subscribe(run: Subscriber<T>) {
        return this.store.subscribe(run);
    }

    public update(updater: Updater<T>) {
        this.store.update(updater)
    }

    public get value(): T {
        return get(this.store);
    }

    public set value(v: T) {
        this.store.set(v);
    }
}

export default CustomEventClass;