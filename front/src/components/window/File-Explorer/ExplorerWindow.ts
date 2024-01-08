import { writable, type Writable } from "svelte/store";
import { Window } from "../Window";

interface ExplorerCtx {
  path: Writable<string>,
  viewType: Writable<"LIST" | "GRID">,
  func: Writable<Record<string, any>>
}

export class ExplorerWindow extends Window {
  ctx: ExplorerCtx;

  constructor(uuid: string) {
    super(uuid, "File-Explorer/Explorer", "File-Explorer/Toolbar")

    this.title = "Explorer"
    this.ticon = "folder"
    this.ctx = {
      path: writable<string>("/"),
      viewType: writable("LIST"),
      func: writable({})
    }
  }

  setFn(key: string, fn: any) {
    this.ctx.func.update(old => ({ ...old, [key]: fn }))
  }
}
