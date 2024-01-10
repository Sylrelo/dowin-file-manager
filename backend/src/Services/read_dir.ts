import { constants, readdir, readlink, stat } from "fs/promises";
import path from "path";
import log from "npmlog";
import { Dirent } from "fs";

export interface Metadata {
  mode: number

  size: number

  accessedAt: number
  modifiedAt: number
  createdAt: number
}

export interface FsContent {
  name: string
  fullPath: string
  path: string

  // isDirectory: boolean
  fileType: number

  metadata?: Metadata

  symlinkOriginalPath?: string
  _symlinkOriginalPath?: string
}

export function getFileType(entry: Dirent, mode?: number) {
  let type = 0;

  if (entry.isDirectory() || (mode & constants.S_IFDIR) === constants.S_IFDIR)
    type |= constants.S_IFDIR;

  if (entry.isFile() || (mode & constants.S_IFREG) === constants.S_IFREG)
    type |= constants.S_IFREG;

  if (entry.isBlockDevice() || (mode & constants.S_IFBLK) === constants.S_IFBLK)
    type |= constants.S_IFBLK;

  if (entry.isCharacterDevice() || (mode & constants.S_IFCHR) === constants.S_IFCHR)
    type |= constants.S_IFCHR;

  if (entry.isFIFO() || (mode & constants.S_IFIFO) === constants.S_IFIFO)
    type |= constants.S_IFIFO;

  if (entry.isSocket() || (mode & constants.S_IFSOCK) === constants.S_IFSOCK)
    type |= constants.S_IFSOCK;

  if (entry.isSymbolicLink() || (mode & constants.S_IFLNK) === constants.S_IFLNK)
    type |= constants.S_IFLNK;

  return type;
}

interface ReadDirOptions {
  ignoreMetadata?: boolean
}

export async function ReadDir(entryPath: string, customOptions: ReadDirOptions = {}): Promise<FsContent[]> {
  const result: FsContent[] = [];
  let dirents: Dirent[] = [];

  const options: ReadDirOptions = {
    ignoreMetadata: false,
    ...customOptions,
  };

  try {
    dirents = await readdir(entryPath, {
      recursive: false,
      withFileTypes: true,
    });
  } catch (error) {
    log.error("ReadDir [readdir]", error.code, entryPath);
    return [];
  }

  for (const dirent of dirents) {
    let metadata: Metadata = undefined;
    let symlinkOriginalPath: string = undefined;
    let _symlinkOriginalPath: string = undefined;

    const fullPath = path.join(entryPath, dirent.name);

    if (dirent.isSymbolicLink()) {
      symlinkOriginalPath = await readlink(fullPath);
      _symlinkOriginalPath = symlinkOriginalPath;

      if (symlinkOriginalPath.startsWith("/") === false) {
        symlinkOriginalPath = path.join(entryPath, symlinkOriginalPath);
      }
    }

    if (options.ignoreMetadata !== true) {
      try {
        const statResult = await stat(symlinkOriginalPath ?? fullPath, {
          bigint: false
        });

        metadata = {
          size: statResult.size,
          mode: statResult.mode,

          accessedAt: statResult.atimeMs,
          modifiedAt: statResult.mtimeMs,
          createdAt: statResult.ctimeMs,
        };
      } catch (error) {
        log.error("ReadDir [stat]", error.code, error.errno, error.syscall, error.path);
      }
    }


    result.push({
      name: dirent.name,
      path: entryPath,
      fullPath,

      symlinkOriginalPath,
      _symlinkOriginalPath,

      fileType: getFileType(dirent, metadata?.mode),

      // @ts-expect-error debug
      _lnk: dirent.isDirectory() ? "http://localhost:3000/dir?q=" + fullPath : undefined,
      metadata
    });
  }

  return result;
}