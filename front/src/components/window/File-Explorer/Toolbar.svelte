<script lang="ts">
  import { slide } from "svelte/transition";
  import ToolbarButton from "../generic-window/ToolbarButton.svelte";
  import type { ExplorerWindow } from "./ExplorerWindow";
  import { formatLongPath } from "./Utils";

  export let win: ExplorerWindow;

  const { path, func } = win.ctx;

  let currentPath = "";
  let splittedPath: string[] = [];
  let showSelector = false;

  $: if ($path) {
    showSelector = false;
    splittedPath = [];
    currentPath = formatLongPath($path);

    const splitted = $path.split("/");

    const count = splitted.length;

    for (let i = 0; i < count; i++) {
      let before: string[] = [];

      for (let j = 0; j <= i; j++) {
        before.push(splitted[j]);
      }

      splittedPath.push(before.join("/"));
    }

    if (!splittedPath[0] || splittedPath[0] === "") splittedPath[0] = "/";
    if (splittedPath[0] === splittedPath[1]) {
      splittedPath = splittedPath.slice(1);
    }

    splittedPath.reverse();
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

  <button
    class="path"
    on:click={() => {
      showSelector = true;
    }}
  >
    {#if showSelector}
      <div
        transition:slide={{ duration: 200 }}
        class="path-selector"
        role="button"
        tabindex="-1"
        on:mouseleave={() => {
          showSelector = false;
        }}
      >
        {#each splittedPath as level (level)}
          <button
            on:click={() => {
              path.set(level);
              showSelector = false;
            }}>{level}</button
          >
        {/each}
      </div>
    {:else}
      {currentPath}
    {/if}
  </button>

  <div style="margin-left: auto; display: flex; gap: inherit;">
    <ToolbarButton
      ticon="folder-plus"
      on:click={() => {
        //TODO
        alert("TODO");
      }}
    />
    <ToolbarButton
      ticon="file-plus"
      on:click={() => {
        //TODO
        alert("TODO");
      }}
    />
  </div>
</div>

<style lang="scss">
  .toolbar {
    display: flex;
    gap: 8px;

    .path-selector {
      position: absolute;
      top: 0px;
      margin-left: -8px;

      z-index: 100;
      background-color: var(--main-color-10);
      display: flex;
      flex-direction: column;
      text-align: left;
      padding: 4px;
      border-radius: inherit;

      width: inherit;

      > button {
        all: unset;
        padding: 4px 0px;
        border-radius: inherit;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        font-size: 12px;

        &:hover {
          background-color: var(--main-color-5);
          cursor: pointer;
        }
      }
    }

    .path {
      all: unset;
      position: relative;
      display: flex;
      align-items: center;

      gap: 4px;
      background-color: var(--main-color-6);
      padding: 0px 8px;
      height: 26px;
      border-radius: 5px;
      font-size: 0.8rem;

      width: fit-content;

      &:hover {
        cursor: pointer;
      }
    }
  }
</style>
