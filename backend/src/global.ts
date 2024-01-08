import { BookmarkDb } from "./Database/bookmarkDb";
import { UserDb } from "./Database/userDb";
import { FsProgress } from "./FsProgress";

export const FS_PROGRESS = new FsProgress();

export const USER_DB = new UserDb();
export const BOOKMARK_DB = new BookmarkDb();

export const SESSIONS: { [key: string]: any } = {};

setTimeout(async () => {
  if (USER_DB.count !== 0) return;

  await USER_DB.create("ADMIN", "ADMIN");
}, 2000);


export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), time);
  });
}