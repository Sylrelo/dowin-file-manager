<script lang="ts">
  import { onMount } from "svelte";
  import { MouseTarget, mouseTarget } from "../events/MouseTarget";
  import { initUploadQueue, uploadJobQueue } from "../services/UploadQueue";

  // =======================================================

  const supportsFileSystemAccessAPI =
    "getAsFileSystemHandle" in DataTransferItem.prototype;

  const supportsWebkitGetAsEntry =
    "webkitGetAsEntry" in DataTransferItem.prototype;

  onMount(() => {
    initUploadQueue();

    uploadJobQueue.subscribe((queue) => {
      if (queue.length > 0) uploadJobQueue.run();
    });
  });
  // =======================================================

  const removeAllDragHighlight = () => {
    const fileElements: NodeListOf<HTMLDivElement> =
      document.querySelectorAll(".file");

    const windowElements: NodeListOf<HTMLDivElement> =
      document.querySelectorAll(".content");

    for (const el of fileElements) {
      el.classList.remove("drag-highlight");
    }
    for (const el of windowElements) {
      el.classList.remove("drag-highlight");
    }
  };

  const highlightDragZone = () => {
    removeAllDragHighlight();

    if ("DIR" === $mouseTarget.file?.type) {
      const element = $mouseTarget.file?.element;
      element.classList.add("drag-highlight");
    } else if ($mouseTarget.content) {
      const element = $mouseTarget.content?.element;
      element.classList.add("drag-highlight");
    }
  };

  // =======================================================

  const addFileToUploadQueue = (
    windowUuid: string,
    path: string,
    file: File
  ) => {
    if (path.endsWith("/")) {
      path.slice(0, -1);
    }

    let filePath = file.webkitRelativePath ?? file.name;

    path += "/" + filePath;

    if (path.endsWith(file.name)) {
      path = path.slice(0, -file.name.length - 1);
    }

    uploadJobQueue.addUpload(windowUuid, path, file);
  };

  const getFileEntryAsFile = async (
    entry: FileSystemFileEntry
  ): Promise<File> => {
    return new Promise(async (resolve, reject) => {
      //@ts-ignore
      if (entry.getFile) {
        //@ts-ignore
        const file = await entry.getFile();
        resolve(file);
      } else {
        entry.file(resolve, reject);
      }
    });
  };

  const recursivelyExploreDirectory = async (
    windowUuid: string,
    path: string,
    item: FileSystemEntry
  ) => {
    //@ts-ignore
    if (item.isFile || item?.kind === "file") {
      const file = await getFileEntryAsFile(item as FileSystemFileEntry);

      addFileToUploadQueue(windowUuid, path, file);
      return;
    }

    //@ts-ignore
    if (item.entries) {
      alert("No Chromium for now.");
      // //@ts-ignore
      // const entries = item.entries();

      // for await (const entry of entries) {
      //   await recursivelyExploreDirectory(path, entry[1]);
      // }
    } else {
      const reader = (item as FileSystemDirectoryEntry).createReader();

      reader.readEntries(async (entries) => {
        for (const entry of entries) {
          await recursivelyExploreDirectory(windowUuid, path, entry);
        }
      });
    }
  };

  /* -------------------------------------------------------------------------- */

  const onDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeAllDragHighlight();

    const files: File[] & FileSystemEntry[] = [];

    let destinationPath: string | undefined = undefined;

    if ("DIR" === $mouseTarget.file?.type) {
      destinationPath = $mouseTarget.file?.path;
    } else {
      destinationPath = $mouseTarget.content?.path;
    }

    if (null == destinationPath) {
      return;
    }

    if (destinationPath == null) {
      console.error("No dst path");
      return;
    }

    let windowUuid: string = $mouseTarget.window?.uuid!;
    if (!supportsFileSystemAccessAPI && !supportsWebkitGetAsEntry) {
      for (const file of e.dataTransfer?.files ?? []) {
        addFileToUploadQueue(windowUuid, destinationPath, file);
        console.warn("Browser do not support FileSystem API.");
      }

      return;
    }

    for (const item of e.dataTransfer?.items ?? []) {
      files.push(
        supportsFileSystemAccessAPI
          ? //@ts-ignore
            item.getAsFileSystemHandle()
          : //@ts-ignore
            item.webkitGetAsEntry()
      );
    }

    for await (const handle of files) {
      //@ts-ignore
      if (handle.kind === "directory" || handle.isDirectory) {
        await recursivelyExploreDirectory(windowUuid, destinationPath, handle);
      } else {
        const asFile = await getFileEntryAsFile(
          handle as unknown as FileSystemFileEntry
        );
        addFileToUploadQueue(windowUuid, destinationPath, asFile);
      }
    }

    removeAllDragHighlight();
  };

  const onDragOver = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    highlightDragZone();
  };

  const updateHoveredElement = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    mouseTarget.value = new MouseTarget(target as HTMLElement);
  };

  /* -------------------------------------------------------------------------- */
</script>

<svelte:document
  on:drop={onDrop}
  on:dragover={onDragOver}
  on:dragenter={updateHoveredElement}
/>
