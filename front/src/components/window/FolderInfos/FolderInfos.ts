
import { writable, type Writable } from "svelte/store";
import { Window } from "../Window"
import type { FolderInfos } from "../../../interfaces";

interface FolderInfosCtx {
  path: Writable<string>,
  data: Writable<FolderInfos>
}

export class FolderInfosWindow extends Window {
  ctx: FolderInfosCtx;

  constructor(uuid: string, path: string) {
    super(uuid, "FolderInfos/Infos", "FolderInfos/InfosToolbar");
    this.ticon = "chart-pie"

    this.title = "Folder Size";
    this.ctx = {
      path: writable(path),
      data: writable({} as FolderInfos)
    };
  }

}