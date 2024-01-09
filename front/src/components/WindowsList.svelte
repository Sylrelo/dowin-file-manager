<script lang="ts">
  import { scale } from "svelte/transition";
  import {
    activeWindow,
    windowListTitleRefresh,
    windowsNew,
  } from "../stores/global";
  import TablerIcon from "./Icons/TablerIcon.svelte";
  import { v4 as uuidv4 } from "uuid";
  import { get } from "svelte/store";
  import { ExplorerWindow } from "./window/File-Explorer/ExplorerWindow";
  import { getLastPath } from "./window/File-Explorer/Utils";
  import { SettingsWindow } from "./window/Settings/SettingWindow";
  import { onMount } from "svelte";
  import { FolderInfosWindow } from "./window/FolderInfos/FolderInfos";

  const openWindow = () => {
    const uuid = uuidv4();
    activeWindow.set(uuid);

    windowsNew.update((old) => [...old, new ExplorerWindow(uuid)]);
  };

  const openSetting = () => {
    const uuid = uuidv4();
    activeWindow.set(uuid);

    windowsNew.update((old) => [...old, new SettingsWindow(uuid)]);
  };
</script>

<div class="win-list">
  <button class="btn" on:click={() => openSetting()}>
    <TablerIcon icon="adjustments" />
  </button>

  <button class="btn" on:click={() => openWindow()}>
    <TablerIcon icon="plus" />
    <span>New Window</span>
  </button>

  {#each $windowsNew as window (window.uuid)}
    <button
      transition:scale={{ duration: 200 }}
      class="win"
      class:is-active={$activeWindow === window.uuid}
      on:click={() => {
        activeWindow.set(window.uuid);
      }}
    >
      <div class="icon"><TablerIcon icon={window.ticon} /></div>

      {#key $windowListTitleRefresh}
        <div class="name">
          {#if window instanceof FolderInfosWindow}
            {get(window.reactiveData).title}: {getLastPath(
              get(window?.ctx?.path)
            )}
          {:else}
            {getLastPath(get(window?.ctx?.path)) ??
              get(window.reactiveData).title}
          {/if}
        </div>
      {/key}
    </button>
  {/each}
</div>

<style lang="scss">
  .win-list {
    position: absolute;
    bottom: 6px;
    left: 6px;

    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    z-index: 200;

    font-size: 0.85rem;

    > .btn {
      background-color: var(--main-color-1);
      padding: 4px 4px;
      border-radius: 5px;
      font-size: 1.1rem;

      display: flex;
      align-items: center;
      gap: 4px;

      > span {
        font-size: 12px;
      }

      &:hover {
        background-color: var(--main-color-5);
        cursor: pointer;
      }
    }

    > .win {
      transition: background-color 0.2s ease-out;
      background-color: var(--main-color-1);
      border: 1px solid var(--main-color-10);
      // box-shadow: #00000055 2px 2px 5px 0px;

      // background-color: var(--main-color-alpha-5);
      // backdrop-filter: blur(var(--primary-blur-strength));

      display: flex;
      align-items: center;
      gap: 6px;

      min-width: 60px;
      max-width: 200px;

      padding: 4px 4px;
      border-radius: 5px;

      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &.is-active {
        background-color: var(--main-color-1);
        border: 1px solid #fff;
      }

      &:hover {
        background-color: var(--main-color-5);
        cursor: pointer;
      }

      > .icon {
        width: 42;
        height: 42;
        background-color: var(--main-color-10);
        border-radius: inherit;

        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
</style>
