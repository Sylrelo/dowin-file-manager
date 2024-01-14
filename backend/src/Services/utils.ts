import { access, constants, mkdir, rmdir } from "fs/promises";
import { ReadDir } from "./read_dir";

export async function createFolderIfNotExists(path: string, recursive: boolean = false) {
  try {
    await mkdir(path, {
      recursive
    });
  } catch (_error) {
    //
  }
}

export async function rmEmptyDir(src: string): Promise<boolean> {
  const entries = await ReadDir(src);

  const hasFiles = entries.find(e => (e.fileType & constants.S_IFDIR) !== constants.S_IFDIR) != null;
  const hasDirectories = entries.find(e => (e.fileType & constants.S_IFDIR) === constants.S_IFDIR) != null;

  let hasError = hasFiles;

  if (hasFiles === false && hasDirectories === false) {
    try {
      await rmdir(src);
    } catch (err) {
      // error("RmEmptyDir Entry", err.code, src);
    }
  }

  for (const entry of entries) {
    if ((entry.fileType & constants.S_IFDIR) === constants.S_IFDIR) {

      const r = await rmEmptyDir(entry.fullPath);
      if (r === false) {
        try {
          await rmdir(src);
        } catch (err) {
          // error("RmEmptyDir", err.code, src);
        }
      }
      hasError ||= r;
    }
  }

  return hasError;
}

export async function FileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (_) {
    return false;
  }
}