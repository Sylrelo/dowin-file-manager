import { rm } from "fs/promises";
import path from "path";
import { FsMove } from "./move";
import { FsContent, ReadDir } from "./read_dir";
import { createFolderIfNotExists } from "./utils";

export async function SendToTrash(src: string) {
  let mount = src.slice(8);

  mount = "/manager/" + mount.split("/")[1] + "/";

  const finalPath = path.join(mount, ".dowin-trashcan", src.replace(mount, ""));

  const basename = path.basename(src);

  await createFolderIfNotExists(finalPath.slice(0, -basename.length), true);

  await FsMove(src, finalPath.slice(0, -basename.length), { overwrite: false });
}

export async function RestoreFromTrash(src: string) {
  const restoredPath = src.replace("/.dowin-trashcan", "");
  const basename = path.basename(restoredPath);

  await createFolderIfNotExists(restoredPath.slice(0, -basename.length), true);

  await FsMove(src, restoredPath.slice(0, -basename.length), { overwrite: false });
}

export async function EmptyAllTrashcans() {
  const mounts = await ReadDir("/manager", { ignoreMetadata: true });
  for (const mount of mounts) {

    await rm(path.join(mount.fullPath, ".dowin-trashcan"), {
      recursive: true,
      force: true
    });
  }
}

export async function ListTrash() {
  const mounts = await ReadDir("/manager", { ignoreMetadata: true });
  const trash: (FsContent & { origin: string })[] = [];

  for (const mount of mounts) {
    const trashedItems = await ReadDir(path.join(mount.fullPath, ".dowin-trashcan"), { ignoreMetadata: true });

    trash.push(...trashedItems.map(f => ({ ...f, origin: mount.fullPath })));
  }

  return trash;
}