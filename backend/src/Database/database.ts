import { mkdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { info } from "npmlog";
import { ReadDir } from "../Services/read_dir";

interface Share {
  uuid: string
  path: string
  duration: number
  createdAt: number
}

export interface UploadSetting {
  maxChunkSize: number
  maxConcurrentChunks: number
  maxConcurrentFileUpload: number
  tmpChunksInMemory: boolean
}

export interface GlobalSetting {
  uploadSettings: UploadSetting
  enableTrashcan: boolean
}

export class JsonDb<T> {
  protected data: T;
  #timeoutSave: NodeJS.Timeout;
  #jsonPath: string = "";

  constructor(jsonPath: string = "", init: T = undefined) {
    if (this.isJsonDatabase) {
      try {
        mkdirSync("database/");
      } catch (_) {
        //
      }
      this.#jsonPath = "database/" + jsonPath;
      this.data = init;
      this.loadJsonDb(init);
    }
  }

  get isJsonDatabase() {
    return process.env["DB_TYPE"] == undefined || process.env["DB_TYPE"] === "json";
  }

  verifyJsonDb() {
    //
  }

  onLoad() {
    //
  }

  async loadJsonDb(init: any) {
    try {
      const data = await readFile(this.#jsonPath,);
      this.data = JSON.parse(data.toString());
      this.verifyJsonDb();
      this.onLoad();
      info("Database", `Loaded ${this.#jsonPath}.`);
    } catch (err) {
      if (err.code === "ENOENT") {
        this.data = init;
        await writeFile(this.#jsonPath, JSON.stringify(init));
      }
    }
  }

  saveJsonDb() {
    clearTimeout(this.#timeoutSave);
    this.#timeoutSave = setTimeout(async () => {
      await writeFile(this.#jsonPath, JSON.stringify(this.data), {
        flag: "w"
      });
    }, 5000);
  }
}

