import { Vec2 } from "../utilities/Vec2";
import { MouseTarget } from "./MouseTarget";
import CustomEventClass from "./_CustomEventClass";

interface MouseButton {
    primary: boolean,
    secondary: boolean,
    middle: boolean,

    target: MouseTarget | null,
    originalTarget: MouseTarget | null,

    position: Vec2
}

class MouseButtonEvent extends CustomEventClass<MouseButton> {
    #initDone = false;

    constructor() {
        super()
        this.update(() => ({
            primary: false,
            middle: false,
            secondary: false,
            target: null,
            originalTarget: null,
            position: new Vec2(0, 0)
        }))
    }

    private mouseDownEvent = (event: MouseEvent): void => {
        this.handleEvent(event, true);
    }

    private mouseUpEvent = (event: MouseEvent): void => {
        this.handleEvent(event, false);
    }

    private handleEvent = (event: MouseEvent, state: boolean): void => {
        switch (event.button) {
            case 0:
                this.upd(event, "primary", state);
                break;
            case 1:
                this.upd(event, "middle", state);
                break;
            case 2:
                this.upd(event, "secondary", state);
                break;
            default:
                break;
        }
    }

    private upd(event: MouseEvent, key: string, state: boolean) {
        let infos: Partial<MouseButton> = {
            target: null,
            position: new Vec2(-1, -1)
        }

        if (true == state) {
            const target = event.target ? new MouseTarget(event.target as HTMLElement) : null;

            infos = {
                target,
                originalTarget: target,
                position: new Vec2(event.x, event.y),
            }
        }

        this.update(old => ({
            ...old,
            [key]: state,
            ...infos,
        }))
    }

    init() {
        if (true == this.#initDone)
            return;
        document.addEventListener("mousedown", this.mouseDownEvent);
        document.addEventListener("mouseup", this.mouseUpEvent);
        this.#initDone = true;
    }
}

export const mouseButtonEvent = new MouseButtonEvent();