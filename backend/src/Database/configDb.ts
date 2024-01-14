import { GlobalSetting, JsonDb } from "./database";

export class SettingsDb extends JsonDb<GlobalSetting> {
  cachedSettings: GlobalSetting = {} as GlobalSetting;

  constructor() {
    super("db_settings.json", {
      uploadSettings: {
        maxChunkSize: 50,
        maxConcurrentChunks: 1,
        maxConcurrentFileUpload: 4,
        tmpChunksInMemory: true,
      },
      enableTrashcan: true,
    });

    if (this.isJsonDatabase && this.data === undefined) {
      this.data = {} as GlobalSetting;
    }
  }


  onLoad(): void {
    this.cachedSettings = this.data;
  }

  async verifyJsonDb(): Promise<void> {
    const uploadSettings = this.data.uploadSettings;

    if (uploadSettings.tmpChunksInMemory != undefined)
      delete uploadSettings.tmpChunksInMemory;

    if (this.data?.enableTrashcan == null)
      this.data.enableTrashcan = true;

    this.saveJsonDb();
  }


  async update(settings: Partial<GlobalSetting>): Promise<GlobalSetting> {
    if (this.isJsonDatabase) {

      // Clean undefined key recursively
      settings = JSON.parse(JSON.stringify(settings));

      this.data = {
        ...this.data,
        ...settings
      };

      this.cachedSettings = this.data;
      this.saveJsonDb();
      return this.data;
    }
  }

  async getSettings(): Promise<GlobalSetting> {
    if (this.isJsonDatabase) {
      return this.data;
    }

    return {} as GlobalSetting;
  }

}