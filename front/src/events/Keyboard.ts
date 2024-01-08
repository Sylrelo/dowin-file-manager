import { Vec2 } from "../utilities/Vec2";
import CustomEventClass from "./_CustomEventClass";

type KeyPressed = Record<string, boolean>

class KeyEvent extends CustomEventClass<KeyPressed> {
  #initDone = false;

  constructor() {
    super()
    this.update(() => ({}))
  }

  private keyDown = (event: KeyboardEvent): void => {
    this.update(old => ({
      ...old,
      [event.key]: true
    }))
  }

  private keyUp = (event: KeyboardEvent): void => {
    this.update(old => ({
      ...old,
      [event.key]: false
    }))
  }

  // private handleEvent = (event: MouseEvent, state: boolean): void => {
  //     switch (event.button) {
  //         case 0:
  //             this.upd(event, "primary", state);
  //             break;
  //         case 1:
  //             this.upd(event, "middle", state);
  //             break;
  //         case 2:
  //             this.upd(event, "secondary", state);
  //             break;
  //         default:
  //             break;
  //     }
  // }

  // private upd(event: MouseEvent, key: string, state: boolean) {
  //     let infos: Partial<MouseButton> = {
  //         target: null,
  //         position: new Vec2(-1, -1)
  //     }

  //     if (true == state) {
  //         infos = {
  //             target: event.target ? new MouseTarget(event.target as HTMLElement) : null,
  //             position: new Vec2(event.x, event.y)
  //         }
  //     }

  //     this.update(old => ({
  //         ...old,
  //         [key]: state,
  //         ...infos,
  //     }))
  // }

  init() {
    if (true == this.#initDone)
      return;
    document.addEventListener("keyup", this.keyUp);
    document.addEventListener("keydown", this.keyDown);
    this.#initDone = true;
  }
}

export const keyEvent = new KeyEvent();