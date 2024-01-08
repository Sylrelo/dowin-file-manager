import { writable } from "svelte/store";
import CustomEventClass from "./_CustomEventClass";
import { Vec2 } from "../utilities/Vec2";

interface MouseMovementInterface {
    position: Vec2,
    movement: Vec2,
}

class MouseMovementEvent extends CustomEventClass<MouseMovementInterface> {
    constructor() {
        super();
        console.log("MouseMovementEvent");
    }

    init() {
        this.position = new Vec2(0, 0);
        this.movement = new Vec2(0, 0);
    }

    get movement() {
        return new Vec2(this.value.movement.x, this.value.movement.y);
    }

    get position() {
        return new Vec2(this.value.position.x, this.value.position.y);
    }

    set movement(movement: Vec2) {
        this.update(old => ({
            ...old,
            movement,
        }))
    }

    set position(position: Vec2) {
        this.update(old => ({
            ...old,
            position,
        }))
    }
}

export const mouseEvent = new MouseMovementEvent();
export const isDragLocked = writable<boolean>(false);
