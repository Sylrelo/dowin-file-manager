<script lang="ts">
  import { slide } from "svelte/transition";
  import TablerIcon from "../components/Icons/TablerIcon.svelte";
  import { mouseButtonEvent } from "../events/MouseButton";
  import type { FileTarget } from "../events/MouseTarget";
  import { Http } from "../http";
  import type { Bookmark } from "../interfaces";
  import {
    bookmarks,
    explorerWindowRefresh,
    selectedForRename,
  } from "../stores/global";
  import { Vec2 } from "../utilities/Vec2";

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

      explorerWindowRefresh.set([windowTargetUuid!, Date.now()]);
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
      <button class="btn" on:click={() => pin()}>
        <TablerIcon icon="pin" />
        Pin to leftbar
      </button>
    {/if}

    <button class="btn" style="margin-top: 6px;" on:click={() => rename()}>
      <TablerIcon icon="pencil" />
      Rename
    </button>

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
    z-index: 200;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;

    font-size: 14px;

    background-color: var(--main-color-0);
    // background-color: #444;
    // box-shadow: #444 0px 0px 30px 0px;

    padding: 4px;
    gap: 0px;

    border-radius: 6px;
    border: 3px solid #444;

    width: 200px;

    > .name {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: auto;
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
