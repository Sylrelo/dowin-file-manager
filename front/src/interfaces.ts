import type { FsContent as FsContentBack } from "@backend/src/Services/read_dir";
import type { Bookmark, BookmarkType } from "@backend/src/Controllers/bookmarks";

import type { Filetype } from "./utilities/Filetype";

type Modify<T, R> = Omit<T, keyof R> & R;

export interface FsContent extends Modify<FsContentBack, {
  fileType: Filetype
}> {
}


export type { FsContentBack, Bookmark, BookmarkType };