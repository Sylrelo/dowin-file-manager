import { readFile, writeFile } from "fs/promises";
interface Share {
  uuid: string
  path: string
  duration: number
  createdAt: number
}

interface GlobalSetting {

}

export class JsonDb<T> {
  protected data: T;
  #timeoutSave: NodeJS.Timeout;
  #jsonPath: string = "";

  constructor(jsonPath: string = "", init: any = undefined) {
    if (this.isJsonDatabase) {
      this.#jsonPath = jsonPath;
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

  async loadJsonDb(init: any) {
    try {
      const data = await readFile(this.#jsonPath);
      this.data = JSON.parse(data.toString());
      this.verifyJsonDb();
      console.log(`Loaded ${this.#jsonPath}.`);
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

