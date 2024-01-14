<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  import { slide } from "svelte/transition";
  import TablerIcon from "../components/Icons/TablerIcon.svelte";
  import { mouseButtonEvent } from "../events/MouseButton";
  import type { FileTarget } from "../events/MouseTarget";
  import { Http } from "../http";
  import type { Bookmark } from "../interfaces";
  import {
    activeWindow,
    bookmarks,
    explorerWindowRefresh,
    selectedForRename,
    windowsNew,
  } from "../stores/global";
  import { Vec2 } from "../utilities/Vec2";
  import { FolderInfosWindow } from "../components/window/FolderInfos/FolderInfos";
  import { ExplorerWindow } from "../components/window/File-Explorer/ExplorerWindow";

  let containerElement: HTMLElement;

  let deleteConfirm = false;
  let isOpen = false;
  // let type: string | undefined | null = "";
  let fileTarget: FileTarget | null = null;
  let windowTargetUuid: string | undefined = undefined;

  let position = new Vec2(0, 0);

  $: if (
    $mouseButtonEvent.secondary === true &&
    $mouseButtonEvent.target?.file
  ) {
    isOpen = true;
    position = $mouseButtonEvent.position;
    fileTarget = $mouseButtonEvent.target.file;
    windowTargetUuid = $mouseButtonEvent.target.window?.uuid;
    deleteConfirm = false;
  }

  $: if ($mouseButtonEvent.primary || $mouseButtonEvent.secondary) {
    const mousePos = $mouseButtonEvent.position;

    if (containerElement != null) {
      const elementSize = containerElement.getBoundingClientRect();

      if (
        mousePos.x > position.x + elementSize.width ||
        mousePos.y > position.y + elementSize.height ||
        mousePos.x < position.x ||
        mousePos.y < position.y
      ) {
        isOpen = false;
        deleteConfirm = false;
      }
    }
  }

  /* -------------------------------- FUNCTIONS ------------------------------- */

  async function remove(): Promise<void> {
    try {
      if (fileTarget?.path == null) {
        return;
      }

      await Http.post("fs/rm", {
        src: fileTarget.path,
      });

      setTimeout(() => {
        explorerWindowRefresh.set([windowTargetUuid!, Date.now()]);
      }, 100);

      isOpen = false;
    } catch (_) {
      deleteConfirm = false;
    }
  }

  async function rename(): Promise<void> {
    try {
      if (fileTarget?.uuid == null) {
        return;
      }

      // explorerWindowRefresh.set([windowTargetUuid!, Date.now()]);
      selectedForRename.set(fileTarget.uuid);
      isOpen = false;
    } catch (_) {}
  }

  async function pin(): Promise<void> {
    try {
      if (fileTarget?.path == null) {
        return;
      }

      const filename = fileTarget.path.slice(
        fileTarget.path.lastIndexOf("/") + 1
      );

      const result: Bookmark = await Http.post("bookmarks", {
        name: filename,
        path: fileTarget.path,
      });

      bookmarks.update((old) => ({
        createdAt: Date.now(),
        bookmarks: [...old.bookmarks, result],
      }));
      isOpen = false;
    } catch (_) {}
  }

  function openFolderInfos(): void {
    if (fileTarget?.path == null) {
      return;
    }

    const uuid = uuidv4();
    activeWindow.set(uuid);

    windowsNew.update((old) => [
      ...old,
      new FolderInfosWindow(uuid, fileTarget!.path!),
    ]);

    isOpen = false;

    // const win2 = $windowsNew[1];
    // (win2 as FolderInfosWindow).ctx.path.set("/Users/slopez/Downloads/TO-NAS");
  }

  async function restoreTrashItem() {
    try {
      if (fileTarget?.path == null) {
        return;
      }

      await Http.post("fs/trashcan/restore", {
        src: fileTarget.path,
      });

      explorerWindowRefresh.set([windowTargetUuid!, Date.now()]);

      isOpen = false;
    } catch (_) {
      //
    }
  }

  function openNewWindow(): void {
    if (fileTarget?.path == null) {
      return;
    }

    const uuid = uuidv4();
    activeWindow.set(uuid);

    windowsNew.update((old) => [
      ...old,
      new ExplorerWindow(uuid, fileTarget!.path!),
    ]);

    isOpen = false;
  }
</script>

{#if isOpen}
  <div
    bind:this={containerElement}
    class="right-click-container"
    style:top={position.y + "px"}
    style:left={position.x + "px"}
    transition:slide={{ duration: 150 }}
  >
    <div class="name">
      {fileTarget?.path.slice(fileTarget.path.lastIndexOf("/") + 1)}
    </div>

    {#if fileTarget?.type === "Directory"}
      <button class="btn" on:click={() => openNewWindow()}>
        <TablerIcon icon="app-window" />
        Open in new window
      </button>
      <button class="btn" on:click={() => openFolderInfos()}>
        <TablerIcon icon="chart-pie" />
        Dir stats
      </button>
      <button class="btn" on:click={() => pin()}>
        <TablerIcon icon="pin" />
        Pin to leftbar
      </button>
      <div style="margin-bottom: 12px;" />
    {/if}

    {#if !fileTarget?.path.includes(".dowin-trashcan")}
      <button class="btn" on:click={() => rename()}>
        <TablerIcon icon="pencil" />
        Rename
      </button>
    {/if}

    {#if fileTarget?.path.includes(".dowin-trashcan/")}
      <button class="btn" on:click={() => restoreTrashItem()}>
        <TablerIcon icon="recycle" />
        Restore
      </button>
    {/if}

    {#if !deleteConfirm}
      <button
        transition:slide={{ duration: 200 }}
        class="btn"
        on:click={() => {
          deleteConfirm = true;
        }}
      >
        <TablerIcon icon="trash" />
        Delete
      </button>
    {:else}
      <button
        transition:slide={{ duration: 200 }}
        class="btn confirm-delete"
        on:mouseleave={() => {
          deleteConfirm = false;
        }}
        on:click={() => remove()}
      >
        <TablerIcon icon="trash" />
        Confirm delete ?
      </button>
    {/if}
  </div>
{/if}

<style lang="scss">
  .right-click-container {
    position: absolute;
    z-index: 90000;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;

    font-size: 14px;

    background-color: var(--main-color-1);
    box-shadow: #00000055 2px 2px 10px 0px;

    padding: 4px;
    gap: 0px;

    border-radius: 6px;
    // border: 3px solid #444;

    width: 200px;

    > .name {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: auto;
      border-radius: 0px;
      border-bottom: 1px solid #666;
    }

    > div,
    > button {
      all: unset;
      display: flex;
      justify-content: start;
      align-items: center;
      gap: 6px;
      padding: 2px 4px;

      width: calc(100% - 8px);
      border-radius: 5px;

      &.btn:hover {
        background-color: #000;
        cursor: pointer;
      }

      transition: all 0.2s ease-out;

      &.confirm-delete {
        font-weight: bold;
        background-color: darkred;
        &:hover {
          background-color: darkred;
        }
      }
    }

    &.show {
      display: block;
    }
  }
</style>
