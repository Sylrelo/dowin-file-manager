<script lang="ts">
  import { onMount } from "svelte";
  import { Http } from "../../../http";
  import type {
    DetailPerFolder,
    FolderInfos,
    FsContent,
  } from "../../../interfaces";
  import { rgbToHex, sizeFormatter } from "../../../utils";
  import type { FolderInfosWindow } from "./FolderInfos";
  import Line from "./Line.svelte";
  import { getTreeSubfolders } from "./Utils";

  export let win: FolderInfosWindow;

  const { path, data: dataCtx } = win.ctx;

  let data: FolderInfos;
  let isLoading = true;
  let perExt: {
    ext: string;
    count: number;
    size: number;
    _start: number;
    _end: number;
    _color: string;
  }[] = [];

  let tree: {
    [key: string]: any;
    _files: FsContent;
  } = {} as any;

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
          _folderCount: data.folderCount,
          _deep: i,
          _files: data.files,
        };
      } else {
        currObj = currObj[p];
        currObj._size += data.size;
        // currObj._count += data.count;
        // currObj._folderCount += data.folderCount;
      }
    }
  }

  function sortTree(obj: any) {
    const tmp = [];

    if (obj == null) {
      return;
    }

    for (const key in obj) {
      const value = obj[key];
      if (key.startsWith("_")) {
        continue;
      }

      tmp.push({ key, size: value._size, value: value });
      sortTree(value);
    }

    tmp.sort((a, b) => b.size - a.size);
    for (const d of tmp) {
      delete obj[d.key];
      obj[d.key] = structuredClone(d.value);
    }
  }

  onMount(async () => {
    try {
      isLoading = true;
      data = await Http.get(`fs/infos?dir=${$path}&detailled`);
      dataCtx.set(data);

      /* ----------------------- GENERATE DATA FOR PIE-CHART ---------------------- */

      for (const ext in data.detailPerExt) {
        perExt.push({
          ext,
          size: data.detailPerExt[ext].size,
          count: data.detailPerExt[ext].count,
          _start: 0,
          _end: 0,
          _color: "",
        });
      }

      perExt.sort((a, b) => b.size - a.size);

      const len = perExt.length;
      const lenSup = perExt.filter((e) => e.size / data.totalSize > 0.1).length;

      for (let i = 0; i < len; i++) {
        const p = perExt[i];

        let prevSize = 0;
        let prevStart = 0;
        let prevEnd = 0;

        if (i > 0) {
          prevSize = perExt[i - 1].size;
          prevEnd = perExt[i - 1]._end;
        }

        const current = p.size / data.totalSize;
        const start = prevStart + prevEnd;
        const end = start + current;

        perExt[i]._end = end;
        perExt[i]._start = start;

        perExt[i]._color = rgbToHex([
          230 * (i / lenSup),
          200 * (i / lenSup),
          255,
        ]);
      }

      /* ------------------------- GENERATE DATA FOR TREE ------------------------- */

      for (const folder of data.detailPerFolder!) {
        folder.path = folder.path.replace($path, "");

        folder.files = folder.files.sort(
          (a, b) => (b.metadata?.size ?? 0) - (a.metadata?.size ?? 0)
        );

        insertTree(folder.path, folder);
      }

      sortTree(tree);

      isLoading = false;
    } catch (err) {
      console.error(err);
    }
  });
</script>

<div style="padding: 8px">
  {#if isLoading}
    Loading...
  {:else}
    <div class="container">
      <div class="per-folder">
        <Line
          tree={{
            _size: data.totalSize,
            _count: data.totalFile,
            _folderCount: data.totalDirectory,
          }}
          path={$path}
          totalSize={data.totalSize}
        />

        {#each getTreeSubfolders(tree) as path}
          <Line tree={tree[path]} {path} totalSize={data.totalSize} deep={1} />
        {/each}
      </div>
      <div class="per-ext">
        <div class="exts-chart">
          <table class="charts-css pie">
            <tbody>
              {#each perExt as p, i (p.ext)}
                <tr>
                  <td
                    style="--start: {p._start}; --end: {p._end}; --color: #{p._color} "
                  >
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="caption">
          {#each perExt as ext, i (ext.ext)}
            <div>
              <div
                class="color"
                class:hide={ext.size / data.totalSize < 0.1}
                style:background-color={"#" + ext._color}
              ></div>

              <div class="ext">{ext.ext}</div>
              <div class="size">{sizeFormatter(ext.size)}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .container {
    position: absolute;

    display: flex;

    gap: 4px;
    overflow: hidden;
    height: calc(100% - var(--titlebar-h) - 4px - 8px);
    width: calc(100% - 8px - 8px);

    .per-ext {
      width: 200px;
      overflow: auto;
    }

    .per-folder {
      width: 100%;
      overflow: auto;
    }
  }

  .exts-chart {
    width: 140px;
    margin: 0 auto;
    font-size: 12px;
    color: white;
  }

  .caption {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    > div {
      display: flex;
      align-items: center;

      gap: 8px;

      > .ext {
        width: 50%;
        text-align: left;
      }

      > .size {
        text-align: right;
        width: 70px;
      }

      > .color {
        width: 14px;
        height: 14px;

        &.hide {
          background-color: #00000044 !important;
        }
      }
    }
  }
</style>
