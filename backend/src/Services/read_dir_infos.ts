import path from "path";
import { FsContent, ReadDir } from "./read_dir";
import { constants, stat } from "fs/promises";

export interface DetailPerFolder {
  path: string
  count: number
  size: number
  files: FsContent[];
}

export interface Details {
  [key: string]: {
    count: number
    size: number
  }
}

export interface FolderInfos {
  totalSize: number
  totalFile: number
  totalDirectory: number

  detailPerExt?: Details
  detailPerFolder?: DetailPerFolder[]
}

interface InfosOptions {
  detailled?: boolean
}

export async function ReadDirSize(entryPath: string, options: InfosOptions = {}): Promise<FolderInfos> {
  const opts: InfosOptions = {
    detailled: false,
    ...options
  };

  try {
    const srcMetadata = await stat(entryPath);

    if (srcMetadata.isFile()) {
      return {
        totalDirectory: 0,
        totalFile: 1,
        totalSize: srcMetadata.size
      };
    }
  } catch (_) {
    return;
  }


  const paths: string[] = [entryPath];
  const detailPerExt: Details = {};
  const detailPerFolder: DetailPerFolder[] = [];

  const result: FolderInfos = {
    totalDirectory: 0,
    totalFile: 0,
    totalSize: 0
  };

  let folderDetailId = -1;
  while (paths.length > 0) {
    const currentPath = paths.pop();

    const entries = await ReadDir(currentPath);

    if (opts.detailled) {
      folderDetailId = detailPerFolder.findIndex(o => o.path === currentPath);

      if (folderDetailId === -1) {
        detailPerFolder.push({
          path: currentPath,
          size: 0,
          count: 0,
          files: []
        });
        folderDetailId = detailPerFolder.length - 1;
      }
    }

    for (const entry of entries) {
      if ((entry.fileType & constants.S_IFDIR) == constants.S_IFDIR) {
        paths.push(entry.fullPath);
        result.totalDirectory++;
      } else {
        result.totalSize += entry.metadata?.size ?? 0;
        result.totalFile++;

        if (opts.detailled) {
          const ext = entry.name.startsWith(".") ? "NO-EXT" : path.extname(entry.name);

          if (!(ext in detailPerExt)) {
            detailPerExt[ext] = {
              count: 0,
              size: 0
            };
          }

          detailPerExt[ext].count++;
          detailPerExt[ext].size += entry.metadata?.size ?? 0;

          // const parentFolders = detailPerFolder.filter(o => currentPath.startsWith(o.path));
          // for (const folder of parentFolders) {
          //   folder.size += entry.metadata?.size ?? 0;
          //   folder.count += 1;
          // }
          detailPerFolder[folderDetailId].size += entry.metadata?.size ?? 0;
          detailPerFolder[folderDetailId].count += 1;
          detailPerFolder[folderDetailId].files.push(entry);
        }
      }
    }

    if (opts.detailled) {
      result.detailPerFolder = detailPerFolder;
      result.detailPerExt = detailPerExt;
    }
  }

  return result;
}