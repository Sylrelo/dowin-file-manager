import { FastifyInstance, RegisterOptions } from "fastify";
import { AnonymousFunction } from "../types";
import { access, statfs } from "fs/promises";
import { ReadDir } from "../Services/read_dir";
import { BOOKMARK_DB } from "../global";
import { error } from "npmlog";

async function FileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (_) {
    return false;
  }
}

async function AvailableSpace(path: string): Promise<Record<string, number>> {
  try {
    const sfs = await statfs(path);

    return {
      bTotal: sfs.blocks * sfs.bsize,
      bFree: sfs.bfree * sfs.bsize,
    };
  } catch (err) {
    error("AvailableSpace", err.code, path);
    return {
      bTotal: 0,
      bFree: 0
    };
  }
}

export enum BookmarkType {
  Mount,
  Pin
}

export interface Bookmark {
  uuid: string

  name: string
  path: string

  type: BookmarkType

  bTotal?: number
  bFree?: number
}

export default function (
  fastify: FastifyInstance,
  _options: RegisterOptions,
  done: AnonymousFunction
) {

  fastify.post("/", async function (req, res) {
    const data: Partial<Bookmark> = req.body;

    const createdBookmark = await BOOKMARK_DB.create(data.path, data.name, BookmarkType.Pin);

    if (createdBookmark == null) {
      res.code(422);
      return {};
    }

    return createdBookmark;
  });

  fastify.get("/", async function (_req, _res) {
    const isRunningInsideDocker = await FileExists("/.dockerenv");
    const bookmarks: Bookmark[] = [];

    const availableSpace = await AvailableSpace("/");
    bookmarks.push({
      uuid: "/",
      name: "/",
      path: "/",
      type: BookmarkType.Mount,
      ...availableSpace
    });

    if (isRunningInsideDocker) {
      const dirs = await ReadDir("/manager");
      const folders = await Promise.all(
        dirs.map(
          async e => ({
            uuid: "--",
            name: e.name,
            path: e.fullPath,
            type: BookmarkType.Mount,
            ...await AvailableSpace(e.fullPath)
          })
        )
      );
      bookmarks.push(...folders);
    }

    bookmarks.push(... await BOOKMARK_DB.getAll());

    return bookmarks;
  });

  done();
}
