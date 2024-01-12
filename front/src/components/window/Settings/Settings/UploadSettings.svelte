<script lang="ts">
  import { getContext, onMount } from "svelte";
  import type { SettingsWindow } from "../SettingWindow";
  import { Http } from "../../../../http";
  import type { GlobalSetting } from "../../../../interfaces";
  import Infobox from "../../../Infobox.svelte";

  const win: SettingsWindow = getContext("win");

  const { func } = win.context;

  let settings: GlobalSetting = {} as GlobalSetting;
  // let originalSettings: GlobalSetting = {} as GlobalSetting;

  let isLoading = true;

  async function save() {
    try {
      await Http.put("settings", "", settings);
      alert("Temporarily, a reload is necessary to load the new settings.");
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  }

  onMount(async () => {
    try {
      isLoading = true;
      settings = await Http.get("settings");

      isLoading = false;
    } catch (err: any) {
      alert(err.message);
    }

    win.setFn("save", save);
  });
</script>

<div class="container">
  {#if isLoading === false}
    <div>
      <span>Maximum size per chunks (Mb, max 200)</span>
      <input
        type="number"
        style="width: 58px"
        bind:value={settings.uploadSettings.maxChunkSize}
      />
    </div>

    <div>
      <span>Concurrent file upload</span>
      <input
        type="number"
        style="width: 58px"
        bind:value={settings.uploadSettings.maxConcurrentFileUpload}
      />
    </div>

    <div>
      <span>Concurrent chunks per file</span>
      <input
        type="number"
        style="width: 58px"
        bind:value={settings.uploadSettings.maxConcurrentChunks}
      />
    </div>

    <div class="d-flex">
      <label for="enable-memory-tmp-chunks"
        >Store temporary chunks in memory</label
      >
      <input
        id="enable-memory-tmp-chunks"
        type="checkbox"
        bind:checked={settings.uploadSettings.tmpChunksInMemory}
      />
    </div>
  {/if}
</div>

<style lang="scss">
  .container {
    padding: 4px;
    display: flex;
    flex-direction: column;

    align-items: start;
    justify-content: center;

    gap: 12px;
    > div {
      display: flex;

      justify-content: space-between;
      align-items: center;

      width: 100%;
      padding-bottom: 4px;

      border-bottom: 1px solid var(--main-color-1);
      > input[type="number"] {
        all: unset;
        border: 1px solid #ffffff55;
        border-radius: 5px;
      }
    }
  }
</style>
