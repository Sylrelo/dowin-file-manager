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
      }
    });

    if (this.isJsonDatabase && this.data === undefined) {
      this.data = {} as GlobalSetting;
    }
  }

  onLoad(): void {
    this.cachedSettings = this.data;
  }

  async update(settings: Partial<GlobalSetting>): Promise<GlobalSetting> {
    if (this.isJsonDatabase) {

      // Clean undefined key recursively
      settings = JSON.parse(JSON.stringify(settings));

      console.log({ settings });
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