<script lang="ts">
  import Container from "../generic-window/Container.svelte";
  import GenericLeftbar from "../generic-window/GenericLeftbar.svelte";
  import Content from "./Content.svelte";
  import { onMount, setContext } from "svelte";
  import type { ExplorerWindow } from "./ExplorerWindow";
  import { get } from "svelte/store";
  import {
    activeWindow,
    explorerWindowRefresh,
    selectedForRename,
    windowListTitleRefresh,
  } from "../../../stores/global";
  import Mount from "./Mount.svelte";
  import { keyEvent } from "../../../events/Keyboard";

  export let win: ExplorerWindow;

  const { path } = win.ctx;
  let _contentElement: HTMLElement;

  $: win && setContext("window-data", win);

  let pathHistory = [get(path)];
  let currentHistoryPath = 0;

  let refresh = 0;

  $: if ($explorerWindowRefresh[0] === win.uuid) {
    refresh = Date.now();
  }

  const onMountChange = (data: CustomEvent) => {
    path.set(data.detail.path);
    searchQuery = "";
    _contentElement.scrollTop = 0;
    // win.mountPoint = data.detail.path;
    // onDirectoryChange(win.mountPoint);
  };

  const onDirectoryChange = (entryPath: string) => {
    const oldPath = $path;
    path.set(entryPath);
    // currentPath = entryPath;

    const currentHistoryPathIndex = pathHistory.findIndex(
      (path) => path == oldPath
    );

    pathHistory = pathHistory.slice(0, currentHistoryPathIndex + 1);
    currentHistoryPath = currentHistoryPathIndex;

    pathHistory.push($path);
    currentHistoryPath += 1;

    windowListTitleRefresh.set(Date.now());
    searchQuery = "";
    _contentElement.scrollTop = 0;
  };

  const onHistoryClick = (way: number) => {
    currentHistoryPath += way;

    if (currentHistoryPath >= pathHistory.length) {
      currentHistoryPath = pathHistory.length - 1;
    }

    if (currentHistoryPath <= 0) {
      currentHistoryPath = 0;
    }

    path.set(pathHistory[currentHistoryPath]);
    windowListTitleRefresh.set(Date.now());
    searchQuery = "";
    _contentElement.scrollTop = 0;
  };

  let searchQuery = "";
  const _lastPressedKey = keyEvent.data;
  $: if (
    $activeWindow === win.uuid &&
    $_lastPressedKey &&
    $selectedForRename === ""
  ) {
    const key = $_lastPressedKey;

    if (key.length === 1) {
      searchQuery += key;
    } else if (key === "Backspace") {
      searchQuery = searchQuery.slice(0, -1);
    } else if (key === "Space") {
      searchQuery += " ";
    }
  }

  onMount(() => {
    win.setFn("historyChange", onHistoryClick);
    win.setFn("reload", function () {
      refresh = Date.now();
    });

    win.setFn("scrollToFilename", function (value: string) {
      searchQuery = value;
    });
  });
</script>

<GenericLeftbar>
  <Mount on:onMountChange={onMountChange} />
</GenericLeftbar>

<Container bind:domElement={_contentElement}>
  <!-- <div class="scrollable"> -->
  <Content
    {refresh}
    path={$path}
    {searchQuery}
    on:onDirectoryChange={(evt) => onDirectoryChange(evt.detail.path)}
  />
  <!-- </div> -->
</Container>

<style lang="scss">
  // .scrollable {
  //     overflow: auto;
  //     height: 100%;
  // }
</style>
