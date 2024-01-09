<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  import dayjs from "dayjs";

  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  const dispatch = createEventDispatcher();

  import { createEventDispatcher, getContext } from "svelte";
  import { isCtrlPressed } from "../../../stores/input";
  import {
    toggleSelection,
    selectedFilesPerWindow,
    singleSelectClick,
    hasMultipleSelect,
    resetWindowSelection,
  } from "../../../stores/pathSelection";

  import { sizeFormatter } from "../../../utils";
  import TablerIcon from "../../Icons/TablerIcon.svelte";
  import type { ExplorerWindow } from "./ExplorerWindow";
  import type { FsContent } from "../../../interfaces";
  import {
    explorerWindowRefresh,
    selectedForRename,
  } from "../../../stores/global";
  import { Http } from "../../../http";

  export let file: FsContent;

  export const win = getContext<ExplorerWindow>("window-data");
  const { viewType } = win.ctx;

  const fileUuid = uuidv4();

  //

  const formatDate = (input: number | undefined): string => {
    if (!input) return "--";

    return dayjs(input).format("DD/MM/YY HH:mm");
  };

  const formatDateRelative = (input: number | undefined): string => {
    if (!input) return "--";

    return dayjs(input).fromNow();
  };

  function getIcon(content: FsContent) {
    let icon = "file-unknown";
    const isSymlink = content.fileType.isSymlink;

    if (content.fileType.isDirectory) {
      icon = "folder-filled";
      if (isSymlink) icon = "folder-symlink";
    } else if (content.fileType.isFile) {
      icon = "file";
      if (isSymlink) icon += "-symlink";
    }

    return icon;
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="file"
  class:view-list={$viewType === "LIST"}
  class:selected={$selectedFilesPerWindow?.[win.uuid]?.find(
    (s) => s.uuid === fileUuid
  )}
  on:mousedown={() => {
    if ($isCtrlPressed || hasMultipleSelect(win.uuid)) return;

    singleSelectClick(win.uuid, fileUuid, file.fullPath);
  }}
  on:click={() => {
    if ($isCtrlPressed) {
      toggleSelection(win.uuid, fileUuid, file.fullPath);
      return;
    } else {
      resetWindowSelection(win.uuid);
      toggleSelection(win.uuid, fileUuid, file.fullPath);
    }
  }}
  on:dblclick={() => dispatch("file-click", file)}
  class:is-directory={file.fileType.isDirectory}
  data-type={file.fileType.isDirectory ? "Directory" : "File"}
  data-path={file.fullPath}
  data-uuid={fileUuid}
>
  <div
    class="icon icon-{$viewType} "
    class:is-file={file.fileType.isFile && !file.fileType.isDirectory}
  >
    {#if file.fileType.isFile && file.ext}
      <TablerIcon icon={getIcon(file)} />
      <span>
        {file.ext}
      </span>
    {:else}
      <TablerIcon icon={getIcon(file)} />
    {/if}
  </div>

  <div class="name">
    {#if $selectedForRename === fileUuid}
      <!-- svelte-ignore a11y-autofocus -->
      <input
        class="file-name"
        type="text"
        value={file.name}
        autofocus
        on:keyup={async (event) => {
          try {
            if (event.key !== "Enter") return;

            const newName = event.currentTarget.value;

            if (
              newName == null ||
              newName.length === 0 ||
              newName === file.name
            ) {
              selectedForRename.set("");
              return;
            }

            await Http.post("fs/rename", {
              path: file.path,
              oldName: file.name,
              newName,
            });

            selectedForRename.set("");
            explorerWindowRefresh.set([win.uuid, Date.now()]);
          } catch (_) {}
        }}
      />
    {:else}
      <div class="file-name">
        {file.name}
      </div>
    {/if}

    {#if file.symlinkOriginalPath}
      <div class="symlink-path">
        {file._symlinkOriginalPath}
      </div>
    {/if}
  </div>

  {#if $viewType === "LIST"}
    <div class="fs-datetime">
      <!-- <div class="created-at">{formatDateRelative(file.created_at)}</div> -->
      <div class="modified-at">
        {formatDateRelative(file.metadata?.modifiedAt)}
      </div>
      <div class="accessed-at">
        {formatDateRelative(file.metadata?.accessedAt)}
      </div>

      <div class="size" style="width: 80px">
        {#if !file.fileType.isDirectory}
          {sizeFormatter(file.metadata?.size)}
        {:else}
          --
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- -------------------------------- CSS PART -------------------------------- -->

<style lang="scss">
  :global(.icon-LIST) {
    // width: 32px !important;
    // height: 32px !important;
    font-size: 2rem;
  }

  :global(.icon-GRID) {
    // width: 64px !important;
    // height: 64px !important;
    font-size: 3.4rem;
  }

  .file {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    padding: 8px;

    font-size: 14px;

    width: 92px;
    height: 92px;

    border-radius: 5px;

    transition: all 0.15s ease-out;

    border-radius: 5px;

    border: 2px solid #00000000;

    &.view-list {
      flex-direction: row;
      justify-content: start;
      height: 24px;
      width: calc(100% - 20px);
      gap: 12px;

      &:nth-child(even) {
        background-color: var(--main-color-5);
      }

      > .name {
        width: unset;
      }
    }

    .fs-datetime {
      // float: right;
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: end;
      margin-left: auto;

      font-size: 0.75rem;
      > div {
        width: 100px;
        text-align: right;
      }

      width: 42%;
    }

    &:hover {
      cursor: pointer;
      > div {
        filter: saturate(1.5) brightness(1.5);
      }
    }

    .icon {
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      width: 32px;

      &.is-file {
        font-size: 18px;
        flex-direction: column;
      }

      > span {
        width: 32px;
        font-size: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &.is-directory > .icon {
      background-color: none;
      color: rgb(188, 141, 11);
    }

    border: 1px solid transparent;

    &.selected {
      border: 1px solid white;
    }

    .name {
      display: flex;
      flex-direction: column;

      max-width: 49%;
      min-width: 49%;
      > div {
        // max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .file-name {
        text-align: left;
      }

      > input {
        all: unset;
        border-bottom: 1px solid white;
        background-color: var(--main-color-0);
        width: 100%;
      }

      .symlink-path {
        text-align: left;
        font-size: 0.7rem;
        opacity: 0.8;
      }
    }
  }
</style>
