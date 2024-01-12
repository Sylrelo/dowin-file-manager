import { JsonDb } from "./database";
import crypto from "crypto";
import { Bookmark, BookmarkType } from "../Controllers/bookmarks";

export class BookmarkDb extends JsonDb<Bookmark[]> {
  constructor() {
    super("db_bookmarks.json", []);

    if (this.isJsonDatabase && this.data === undefined) {
      this.data = [];
    }
  }

  get count() {
    return Object.keys(this.data).length;
  }

  async create(path: string, name: string, type: BookmarkType): Promise<Bookmark | null> {
    if (this.isJsonDatabase) {
      if (this.data.find(b => b.path === path)) {
        return null;
      }

      const uuid = crypto.randomUUID();
      this.data.push({
        path, name, type, uuid
      });

      this.saveJsonDb();

      return this.data[this.data.length - 1];
    }
  }

  async getAll() {
    if (this.isJsonDatabase) {
      return this.data;
    }

    return [];
  }

}