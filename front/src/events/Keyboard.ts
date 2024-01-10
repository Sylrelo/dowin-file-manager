import { get, writable, type Writable } from "svelte/store";
import { Vec2 } from "../utilities/Vec2";
import CustomEventClass from "./_CustomEventClass";

type KeyPressed = Record<string, boolean> & { _lastPressedKey: string | null }

class KeyEvent extends CustomEventClass<KeyPressed, Writable<string | null>> {
  #initDone = false;
  #timeout: any = null;

  constructor() {
    super()
    this.update(() => ({} as any))
    this.data = writable(null);
  }

  private keyDown = (event: KeyboardEvent): void => {
    const _lastPressedKey = get(this.data) !== event.key ? event.key : null
    this.data.set(_lastPressedKey);

    setTimeout(() => {
      this.data.set(null);
    }, 100);

    this.update(old => ({
      ...old,
      [event.key]: true
    }))
  }

  private keyUp = (event: KeyboardEvent): void => {
    this.update(old => ({
      ...old,
      [event.key]: false,
    }))
  }

  init() {
    if (true == this.#initDone)
      return;
    document.addEventListener("keyup", this.keyUp);
    document.addEventListener("keydown", this.keyDown);
    this.#initDone = true;
  }
}

export const keyEvent = new KeyEvent();