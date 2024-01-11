import { info } from "npmlog";
import { BookmarkDb } from "./Database/bookmarkDb";
import { UserDb } from "./Database/userDb";
import { FsProgress } from "./FsProgress";


/* --------------------------------- CONSTS --------------------------------- */

export const PATH_PREFIX = process.env?.["FM_PATH_PREFIX"] ?? "/";
export const SESSION_TIMEOUT = 1000 * 3600 * 12;

/* -------------------------------- DATABASE -------------------------------- */

export const USER_DB = new UserDb();
export const BOOKMARK_DB = new BookmarkDb();


export interface UserSession {
  userUuid: string
  ip: string
  userAgent: string
  createdAt: number
}

export const FS_PROGRESS = new FsProgress();
export const SESSIONS: { [key: string]: UserSession } = {};
export const BANNED_IP_TIMEOUT: { [key: string]: any } = {};


setTimeout(async () => {
  if (USER_DB.count !== 0) return;

  const password = Math.random().toString(36).slice(2, 8);

  info("Default account", `Default "Admin" account created with password "${password}". Don't forget to change it.`);

  await USER_DB.create("Admin", password, "ADMIN");
}, 2000);


export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), time);
  });
}