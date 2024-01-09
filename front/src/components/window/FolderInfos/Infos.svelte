<script lang="ts">
  import { onMount } from "svelte";
  import type { DetailPerFolder, FolderInfos } from "../../../interfaces";
  import Container from "../generic-window/Container.svelte";
  import { Http } from "../../../http";
  import type { FolderInfosWindow } from "./FolderInfos";
  import { sizeFormatter } from "../../../utils";
  import Line from "./Line.svelte";
  import { getTreeSubfolders } from "./Utils";

  export let win: FolderInfosWindow;

  const { path } = win.ctx;

  let data: FolderInfos;
  let isLoading = true;

  interface DetailPerFolderCustom extends DetailPerFolder {
    children: DetailPerFolderCustom[];
  }

  let perFolders: DetailPerFolderCustom[] = [];

  let tree: { [key: string]: any } = {
    // "": {
    //   _size: 0,
    //   _count: 0,
    //   _deep: 0,
    // },
  };

  function insertTree(entryPath: string, data: DetailPerFolder) {
    const splitPath = entryPath.split("/");

    let currObj = tree;

    for (let i = 0; i < splitPath.length; i++) {
      const p = splitPath[i];

      if (p === "") continue;

      if (currObj?.[p] == null) {
        currObj[p] = {
          _size: data.size,
          _count: data.count,
          _deep: i,
          _files: data.files,
        };
      } else {
        currObj = currObj[p];
        currObj._size += data.size;
        currObj._count += data.count;
      }
    }
  }

  onMount(async () => {
    try {
      isLoading = true;
      data = await Http.get(`fs/infos?dir=${$path}&detailled`);

      // data.detailPerFolder = data.detailPerFolder?.sort(
      //   (a, b) => a.size - b.size
      // );

      for (const folder of data.detailPerFolder!) {
        folder.path = folder.path.replace($path, "");

        insertTree(folder.path, folder);
      }

      isLoading = false;
    } catch (err) {
      console.error(err);
    }
  });
</script>

<!-- <Container withLeftbar={false}>aa</Container> -->

<div style="padding: 8px">
  {#if isLoading}
    Loading...
  {:else}
    <div class="infos-container">
      <div class="info">
        <div class="label">Size</div>
        <div class="value">{sizeFormatter(data.totalSize)}</div>
      </div>
      <div class="info">
        <div class="label">Directories</div>
        <div class="value">{data.totalDirectory}</div>
      </div>
      <div class="info">
        <div class="label">Files</div>
        <div class="value">{data.totalFile}</div>
      </div>
    </div>

    <div class="container">
      <div class="per-folder">
        {#each getTreeSubfolders(tree) as path}
          <Line tree={tree[path]} {path} totalSize={data.totalSize} />
        {/each}
      </div>
      <div class="per-ext">b</div>
    </div>
  {/if}
</div>

<style lang="scss">
  .container {
    display: flex;
    gap: 4px;
    overflow: hidden;
    height: 400px;

    .per-ext {
      width: 300px;
      background-color: darkred;
    }

    .per-folder {
      width: 100%;
      overflow: auto;
    }
  }

  .infos-container {
    display: flex;
    gap: 12px;

    .info {
      display: flex;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 3px;
      background-color: var(--main-color-10);
      font-size: 14px;

      .label {
        font-weight: bold;
        text-align: left;
        min-width: 100px;
      }

      .value {
        background-color: var(--main-color-1);
        padding: 0px 8px;
        border-radius: inherit;
      }
    }
  }
</style>
