<script lang="ts">
  import { formatNumber, sizeFormatter } from "../../../utils";
  import TablerIcon from "../../Icons/TablerIcon.svelte";
  import { doesTreeContainSubfolder, getTreeSubfolders } from "./Utils";

  export let tree: { [key: string]: any };

  export let path: string;
  export let isFile: boolean = false;

  export let deep: number = 0;
  export let totalSize: number = 0;

  let isExpanded = deep < 2;
</script>

<div class="container">
  <button
    class="info"
    type="button"
    class:is-expanded={isExpanded}
    disabled={!doesTreeContainSubfolder(tree)}
    on:click={() => {
      isExpanded = !isExpanded;
    }}
  >
    <div class="path" style:left={deep * 4 + "px"}>
      <div>
        {#if isFile}
          <TablerIcon icon="file" />
        {:else}
          <TablerIcon icon="folder-filled" />
        {/if}
      </div>

      <span style:width={`calc(100% - ${deep * 10}px)`}>
        {path}
      </span>
    </div>
    <div class="visual-size">
      <span>{((tree._size / totalSize) * 100).toFixed(1)} %</span>
      <div style:width={(tree._size / totalSize) * 100 + "px"}></div>
    </div>
    <div class="size">{sizeFormatter(tree._size)}</div>
    <div class="d-flex count" style="gap: 3px; justify-content:end;">
      {formatNumber(tree._folderCount)}
      <TablerIcon icon="folder" />
    </div>
    <div class="d-flex count" style="gap: 3px">
      <TablerIcon icon="file" />
      {formatNumber(tree._count)}
    </div>
  </button>

  {#if isExpanded}
    <div>
      {#each getTreeSubfolders(tree) as p}
        <svelte:self
          {totalSize}
          tree={tree[p]}
          path={p}
          deep={tree[p]._deep ?? 0}
        />
      {/each}

      {#each tree._files ?? [] as file}
        <svelte:self
          {totalSize}
          tree={{
            _size: file.metadata.size ?? 0,
          }}
          path={file.name}
          deep={deep + 1}
          isFile
        />
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    font-size: 12px;

    .info {
      all: unset;

      padding: 2px 8px;

      &:hover:not(:disabled) {
        cursor: pointer;
        background-color: var(--main-color-5);
      }
      &.is-expanded {
        font-weight: bold;
      }

      display: flex;
      align-items: center;
      gap: 6px;

      // > div {
      //   text-align: center;
      //   width: 5%;
      // }
      > .count {
        width: 60px;
      }

      > .size {
        width: 60px;
        text-align: left;
      }

      > .visual-size {
        position: relative;
        width: 90px;
        display: block;
        height: 16px;
        border: 1px solid rgb(77, 77, 214);
        border-radius: 3px;
        overflow: hidden;

        > span {
          position: absolute;
          right: 4px;
        }

        > div {
          height: inherit;
          background-color: rgb(77, 77, 214);
        }
      }

      > .path {
        width: 50%;
        text-align: left;
        display: flex;
        align-items: center;
        justify-content: start;
        gap: 4px;

        position: relative;

        > span {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }
    }
  }
</style>
