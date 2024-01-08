import type { Subscriber, Unsubscriber, Writable } from "svelte/store";

class StoreSubscriber {
    unsubscribers: Unsubscriber[] = [];

    new<T>(store: Writable<T>, data: Subscriber<T>) {
        this.unsubscribers.push(store.subscribe(data))
    }

    cleanup() {
        for (const unsubscriber of this.unsubscribers) {
            unsubscriber()
        }
    }
}

export default StoreSubscriber