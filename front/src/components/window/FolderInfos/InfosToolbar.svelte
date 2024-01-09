<script lang="ts">
  import { get, type Writable } from "svelte/store";
  import ToolbarButton from "../generic-window/ToolbarButton.svelte";
  import { fade } from "svelte/transition";
  import type { FolderInfosWindow } from "./FolderInfos";
  import { sizeFormatter } from "../../../utils";

  export let win: FolderInfosWindow;

  const { path, data } = win.ctx;

  let currentPath: string;

  $: if ($path) {
    currentPath = $path;
  }
</script>

<div class="container">
  <div>
    <div class="infos-container">
      <div class="info">
        <div class="label">Size</div>
        <div class="value">{sizeFormatter($data.totalSize)}</div>
      </div>
      <div class="info">
        <div class="label">Directories</div>
        <div class="value">{$data.totalDirectory ?? "-"}</div>
      </div>
      <div class="info">
        <div class="label">Files</div>
        <div class="value">{$data.totalFile ?? "-"}</div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .container {
    position: relative;

    > div {
      position: absolute;
      display: flex;
      // justify-content: space-between;
      align-items: center;

      flex-grow: 1;

      gap: 4px;
      width: 100%;
    }
  }

  .infos-container {
    display: flex;
    gap: 8px;

    .info {
      display: flex;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 3px;
      background-color: var(--main-color-6);
      font-size: 12px;

      .label {
        font-weight: bold;
        text-align: left;
        min-width: 70px;
      }

      .value {
        background-color: var(--main-color-0);
        padding: 0px 8px;
      }
    }
  }
</style>
