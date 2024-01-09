
import { writable, type Writable } from "svelte/store";
import { Window } from "../Window"

interface FolderInfosCtx {
  path: Writable<string>
}

// export interface UserFn {
//   del: (uuid: string) => Promise<void>,
//   add: () => Promise<void>
// }

export class FolderInfosWindow extends Window {
  ctx: FolderInfosCtx;

  constructor(uuid: string) {
    super(uuid, "FolderInfos/Infos", "");
    this.ticon = "unknown"

    this.title = "FolderInfos";
    this.ctx = {
      path: writable("/users"),
    };
  }

}