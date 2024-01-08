import { ProgressData } from "copy-file";
import { constants, rename, stat, unlink } from "fs/promises";
import { CopyFile } from "./copy";
import { FsContent, ReadDir, getFileType } from "./read_dir";
import { createFolderIfNotExists, rmEmptyDir } from "./utils";
import path from "path";
import { Dirent } from "fs";
import { Aborter } from "../Controllers/fs";

interface MoveOptions {
  overwrite?: boolean
  onProgress?: (progress: ProgressData) => void
  isCancelled?: Aborter
}

async function MoveFile(entry: FsContent, dstFilePath: string, options: MoveOptions): Promise<void> {
  // if ((entry.fileType & constants.S_IFLNK) === constants.S_IFLNK) {
  //   error("MoveFile", "File is a Symbolic Link", entry.name);
  //   return;
  // }

  try {
    await rename(entry.fullPath, dstFilePath);
    options.onProgress?.({
      destinationPath: dstFilePath,
      percent: 1.0,
      size: entry.metadata?.size,
      writtenBytes: entry.metadata?.size,
      sourcePath: entry.fullPath
    });

  } catch (err) {
    if (err.code === "EXDEV") {
      await CopyFile(entry, dstFilePath, {
        overwrite: options.overwrite,
        onProgress: options.onProgress
      });
      await unlink(entry.fullPath);
    }
  }
}

export async function FsMove(srcPath: string, dstPath: string, options: MoveOptions = {}): Promise<void> {
  const opt: MoveOptions = {
    overwrite: true,
    onProgress: undefined,
    ...options
  };

  const srcMetadata = await stat(srcPath);
  await createFolderIfNotExists(dstPath);

  const basename = path.basename(srcPath);
  dstPath = path.join(dstPath, basename);

  if (srcMetadata.isDirectory()) {
    const srcs: string[] = [srcPath];

    while (srcs.length > 0) {
      if (opt.isCancelled)
        break;

      const currentDir = srcs.pop();
      const currentDstDir = currentDir.replace(srcPath, dstPath);
      await createFolderIfNotExists(currentDstDir);

      const entries = await ReadDir(currentDir);

      for (const entry of entries) {
        if ((entry.fileType & constants.S_IFDIR) === constants.S_IFDIR) {
          srcs.push(entry.fullPath);
        } else {
          const dstFilePath = entry.fullPath.replace(srcPath, dstPath);
          await MoveFile(entry, dstFilePath, opt);
        }
      }
    }

    await rmEmptyDir(srcPath);
  } else if (srcMetadata.isFile()) {

    const filename = path.basename(srcPath);
    const dstFilePath = path.join(dstPath, filename);

    await MoveFile({
      fullPath: srcPath,
      name: filename,
      fileType: getFileType(srcMetadata as unknown as Dirent),
      metadata: undefined,
      path: "",
    }, dstFilePath, opt);
  }

}