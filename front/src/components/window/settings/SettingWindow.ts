import { writable, type Writable } from "svelte/store"
import { Window } from "../Window"

interface SettingsWindowCtx {
  path: Writable<string>
  selected: Writable<string[]>
  func: Writable<any>
  isBusy: Writable<boolean>
  params: Writable<Record<string, any>>
}

export interface UserFn {
  del: (uuid: string) => Promise<void>,
  add: () => Promise<void>
}

export class SettingsWindow extends Window {
  context: SettingsWindowCtx;

  constructor(uuid: string) {
    super(uuid, "Settings/Settings", "Settings/SettingsToolbar");
    this.ticon = "settings"

    this.title = "Settings";
    this.context = {
      path: writable("/users"),
      selected: writable([]),
      func: writable({}),
      isBusy: writable(false),
      params: writable({})
    };
  }

  setFn(key: string, fn: any) {

    // console.debug("Adding func to ctx ", key, { fn })
    this.context.func.update(old => ({
      ...old,
      [key]: fn
    }));
  }

  resetCtx() {
    this.context = {
      path: this.context.path,
      selected: this.context.selected,
      func: this.context.func,
      isBusy: this.context.isBusy,
      params: this.context.params
    }

    this.context.isBusy.set(false)
    this.context.selected.set([])
    this.context.func.set({})
  }
}