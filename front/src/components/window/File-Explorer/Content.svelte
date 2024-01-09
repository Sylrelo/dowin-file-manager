<script lang="ts">
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import File from "./File.svelte";
  import { Http } from "../../../http";

  import { resetWindowSelection } from "../../../stores/pathSelection";
  import type { ExplorerWindow } from "./ExplorerWindow";
  import type { FsContent, FsContentBack } from "../../../interfaces";
  import { Filetype } from "../../../utilities/Filetype";

  export let path: string = "";
  export let refresh: number = 0;

  const dispatch = createEventDispatcher();
  const win = getContext<ExplorerWindow>("window-data");
  const { viewType } = win.ctx;

  let content: FsContent[] = [];
  let isLoading: boolean = true;

  const openDirectory = async (inPath: string) => {
    isLoading = true;
    resetWindowSelection(win.uuid);
    const result: FsContentBack[] = await Http.get("dir?q=" + inPath);
    result.sort((a, b) => a.fileType - b.fileType);

    content = result.map((f) => {
      const indexExt = f.name.lastIndexOf(".");

      return {
        ...f,
        fileType: new Filetype(f.fileType),
        ext: indexExt !== -1 ? f.name.slice(indexExt + 1) : undefined,
      };
    });

    isLoading = false;
  };

  $: (path || refresh) && openDirectory(path);

  const onFileOpen = async (file: FsContent) => {
    if (!file.fileType.isDirectory) {
      return;
    }

    const currPath = file.fullPath;
    // const currPath =
    //     file.fullPath.length == 1 && file.fullPath[0] == "/"
    //         ? file.fullPath + file.name
    //         : file.fullPath + "/" + file.name;

    dispatch("onDirectoryChange", {
      name: file.name,
      path: file.fullPath,
      completePath: currPath,
    });
  };
</script>

<!-- {#key path} -->
<div
  class="content"
  class:loading={isLoading}
  class:view-list={$viewType === "LIST"}
  data-path={path}
>
  <!-- <div style="margin-top: 22px"></div> -->

  {#if content.length == 0}
    <div class="empty">
      Empty {":("}
    </div>
  {/if}

  {#each content as file (file.fullPath)}
    <File on:file-click={() => onFileOpen(file)} {file} />
  {/each}

  {#if win.viewType === "LIST"}
    <div
      style=" position: absolute;  top: 38px; height: 32px; background-color: var(--main-color-8); display:  flex; width: calc(100% - 32px); padding: 0px 8px;"
    >
      <div>file</div>
      <div
        style="margin-left: auto; display: flex; gap: 8px; text-align:right; font-size: 0.75rem;"
      >
        <!-- <div style="width: 100px;">created</div> -->
        <div style="width: 100px;">modified</div>
        <div style="width: 100px;">accessed</div>
        <div style="width: 80px">size</div>
      </div>
    </div>
  {/if}
</div>

<!-- {/key} -->

<style lang="scss">
  .content {
    display: flex;
    // flex-wrap: wrap;
    justify-content: start;
    align-items: start;

    gap: 8px;

    width: 100%;
    height: 100%;

    &.view-list {
      flex-direction: column;
    }

    transition: filter 0.2s ease-out;

    &.loading {
      filter: saturate(0.2) brightness(0.7);
    }
    .empty {
      font-size: 1.3rem;
      font-weight: bold;
    }
  }
</style>
