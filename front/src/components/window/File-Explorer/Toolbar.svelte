<script lang="ts">
  import ToolbarButton from "../generic-window/ToolbarButton.svelte";
  import type { ExplorerWindow } from "./ExplorerWindow";
  import { formatLongPath } from "./Utils";

  export let win: ExplorerWindow;

  const { path, func } = win.ctx;

  let currentPath = "";

  $: if ($path) {
    currentPath = formatLongPath($path);
  }
</script>

<div class="toolbar">
  <ToolbarButton
    ticon="arrow-left"
    on:click={() => {
      $func.historyChange(-1);
    }}
  />

  <ToolbarButton
    ticon="arrow-right"
    on:click={() => {
      $func.historyChange(+1);
    }}
  />

  <ToolbarButton
    ticon="reload"
    on:click={() => {
      $func.reload();
    }}
  />

  <div class="path">
    {currentPath}
  </div>
</div>

<style lang="scss">
  .toolbar {
    display: flex;
    gap: 8px;

    .path {
      display: flex;
      align-items: center;

      gap: 4px;
      background-color: var(--main-color-6);
      padding: 0px 8px;
      height: 26px;
      border-radius: 5px;
      font-size: 0.8rem;
    }
  }
</style>
