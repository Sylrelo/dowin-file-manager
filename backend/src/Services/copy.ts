import { AsyncOptions, Options, ProgressData } from "copy-file";
import { Dirent, Stats } from "fs";
import { constants, copyFile as fsCopyFile, stat, symlink } from "fs/promises";
import { error } from "npmlog";
import path from "path";
import { Aborter } from "../Controllers/fs";
import { sleep } from "../global";
import { FsContent, ReadDir, getFileType } from "./read_dir";
import { createFolderIfNotExists } from "./utils";

let copyFile: (source: string, destination: string, options?: Options & AsyncOptions) => Promise<void>;

(async () => {
  const { copyFile: cf } = await (eval("import(\"copy-file\")") as Promise<typeof import("copy-file")>);
  copyFile = cf;
})();

interface CopyOptions {
  overwrite?: boolean
  onProgress?: (progress: ProgressData) => void
  isCancelled?: Aborter
}

function createProgressData(entry: FsContent, dstFilePath: string): ProgressData {
  return {
    destinationPath: dstFilePath,
    percent: 1.0,
    size: entry.metadata?.size,
    writtenBytes: entry.metadata?.size,
    sourcePath: entry.fullPath
  };
}

export async function CopyFile(entry: FsContent, dstFilePath: string, options: CopyOptions) {
  if ((entry.fileType & constants.S_IFLNK) === constants.S_IFLNK) {
    try {
      // const basename = path.basename(dstFilePath);
      // const dst = path.join(dstFilePath.slice(0, - basename.length), entry._symlinkOriginalPath);

      await symlink(entry._symlinkOriginalPath, dstFilePath);
      options.onProgress?.(createProgressData(entry, dstFilePath));
    } catch (err) {
      error("CopyFile SYMLINK", err.code, err.message);
    }
    return;
  }

  if (entry.metadata?.size <= 20 * 1000 * 1000) {
    let flags = constants.COPYFILE_FICLONE;
    if (options.overwrite === false)
      flags |= constants.COPYFILE_EXCL;

    await fsCopyFile(entry.fullPath, dstFilePath, flags);
    options.onProgress?.(createProgressData(entry, dstFilePath));
  } else {
    await copyFile(entry.fullPath, dstFilePath, {
      overwrite: options.overwrite,
      onProgress: options.onProgress
    });
  }
}

export async function FsCopy(srcPath: string, dstPath: string, options: CopyOptions = {}): Promise<void> {
  const opt: CopyOptions = {
    overwrite: true,
    onProgress: undefined,
    ...options
  };

  let srcMetadata: Stats;
  try {
    srcMetadata = await stat(srcPath);
  } catch (_) {
    return;
  }

  await createFolderIfNotExists(dstPath);

  const srcs: string[] = [];

  const START_TIME = Date.now();

  if (srcMetadata.isDirectory()) {
    const basename = path.basename(srcPath);
    dstPath = path.join(dstPath, basename);

    srcs.push(srcPath);

    while (srcs.length > 0) {
      if (opt.isCancelled)
        break;

      await sleep(5000);
      const currentDir = srcs.pop();
      const currentDstDir = currentDir.replace(srcPath, dstPath);

      await createFolderIfNotExists(currentDstDir);

      const entries = await ReadDir(currentDir);

      for (const entry of entries) {
        if ((entry.fileType & constants.S_IFDIR) === constants.S_IFDIR) {
          srcs.push(entry.fullPath);
        } else {
          const dstFilePath = entry.fullPath.replace(srcPath, dstPath);
          await CopyFile(entry, dstFilePath, opt);
        }
      }
    }
  } else if (srcMetadata.isFile()) {
    const filename = path.basename(srcPath);
    const dstFilePath = path.join(dstPath, filename);

    await CopyFile({
      fullPath: srcPath,
      name: filename,
      fileType: getFileType(srcMetadata as unknown as Dirent),
      metadata: undefined,
      path: srcPath,
    }, dstFilePath, opt);
  }

  console.log(Date.now() - START_TIME + "ms");
}
