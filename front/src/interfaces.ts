import type { FsContent as FsContentBack } from "@backend/src/Services/read_dir";
import type { Bookmark, BookmarkType } from "@backend/src/Controllers/bookmarks";
import type { FolderInfos, DetailPerFolder, Details } from "@backend/src/Services/read_dir_infos";
import type { User } from "@backend/src/Database/userDb";
import type { GlobalSetting, UploadSetting } from "@backend/src/Database/database";


import type { Filetype } from "./utilities/Filetype";

type Modify<T, R> = Omit<T, keyof R> & R;

export interface FsContent extends Modify<FsContentBack, {
  fileType: Filetype
  ext?: string,
}> {
}


export type {
  FsContentBack,
  Bookmark, BookmarkType,
  FolderInfos, DetailPerFolder, Details,
  User,

  GlobalSetting, UploadSetting
};