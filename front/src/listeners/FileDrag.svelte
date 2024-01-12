<script lang="ts">
  import { mouseButtonEvent } from "../events/MouseButton";
  import { MouseTarget, mouseTarget } from "../events/MouseTarget";
  import { mouseEvent } from "../events/MouseMovement";
  import { selectedFilesPerWindow } from "../stores/pathSelection";
  import { fsJobQueue, type FsJobType } from "../services/FsQueue";
  import { Vec2 } from "../utilities/Vec2";
  import { keyEvent } from "../events/Keyboard";
  import TablerIcon from "../components/Icons/TablerIcon.svelte";
  import { slide } from "svelte/transition";
  import { CurrentDrag, currentDrag } from "../stores/global";

  // ==========================================================================

  let isDraggingFile = false;

  let targetOnRelease: MouseTarget | null = null;
  let targetOnStart: MouseTarget | null = null;

  let startPosition: Vec2 | null = null;

  let showConfirmation: boolean = false;
  let positionOnRelease: Vec2 = new Vec2(0, 0);

  $: $mouseButtonEvent && detectDragEnd();
  $: $mouseEvent &&
    ($currentDrag === CurrentDrag.None || $currentDrag === CurrentDrag.File) &&
    detectDragStart();
  $: $keyEvent && keyboardEvent();

  const closeConfirmation = () => {
    showConfirmation = false;
    resetDragHighlight();
  };

  const keyboardEvent = () => {
    if (true == keyEvent.value["Escape"]) {
      startPosition = null;
      isDraggingFile = false;
      resetDragHighlight();
    }
  };

  const detectDragEnd = () => {
    startPosition = null;
    currentDrag.set(CurrentDrag.None);

    if (false == isDraggingFile) {
      return;
    }

    if (false == $mouseButtonEvent.primary) {
      isDraggingFile = false;
      targetOnRelease = $mouseTarget;

      if (
        targetOnRelease.file?.type == "Directory" ||
        targetOnRelease.content
      ) {
        positionOnRelease = mouseEvent.position;
        showConfirmation = true;
      }
    }
  };

  const detectDragStart = () => {
    highlightDropzone();

    if (true == isDraggingFile) return;
    if (false == $mouseButtonEvent.primary) return;
    if (null == $mouseTarget.file) return;

    currentDrag.set(CurrentDrag.File);

    let tmpMousePos = new Vec2(mouseEvent.position.x, mouseEvent.position.y);

    if (null == startPosition) {
      startPosition = new Vec2(mouseEvent.position.x, mouseEvent.position.y);
    }

    if (null != startPosition && startPosition.sub(tmpMousePos).lenght >= 30) {
      targetOnRelease = null;
      isDraggingFile = true;
      targetOnStart = $mouseButtonEvent.target;
    }
  };

  const handleDragRelease = (action: string) => {
    closeConfirmation();

    if (null == targetOnStart || null == targetOnRelease) return;

    const winSrc = targetOnStart.window;
    if (null == winSrc) {
      console.error("[null src] Should not happens, but just in case...");
      return;
    }

    const dstPath = targetOnRelease.file?.path ?? targetOnRelease.content?.path;
    if (null == dstPath) {
      console.error("[null dst] Should not happens, but just in case...");
      return;
    }

    if (targetOnRelease.file && "Directory" != targetOnRelease.file.type)
      return;

    const srcs = $selectedFilesPerWindow[winSrc.uuid];

    fsJobQueue.addMultiple(
      targetOnRelease.window!.uuid!,
      action as FsJobType,
      srcs,
      dstPath
    );
  };

  const highlightDropzone = () => {
    if (null == mouseTarget.value || false == isDraggingFile) return;

    // TODO:
    // - Create helper "isDraggedElement" or something else
    // - Do the highlight directly in File.svelte
    resetDragHighlight();

    if (mouseTarget.file && mouseTarget.file.type == "Directory") {
      mouseTarget.file.element.classList.add("focus-drag");
      mouseTarget.file.element.classList.add("drag-highlight"); //debug to-remove
    } else if (mouseTarget.content) {
      mouseTarget.content.element.classList.add("drag-highlight");
    }
  };

  const resetDragHighlight = () => {
    const windows = document.querySelectorAll(".content");
    const files = document.querySelectorAll(".file");

    for (const file of files) {
      file.classList.remove("focus-drag");
      file.classList.remove("drag-highlight"); //debug to-remove
    }
    for (const window of windows) {
      window.classList.remove("drag-highlight");
    }
  };

  // ==========================================================================

  $: if ($fsJobQueue) {
    fsJobQueue.run();
  }
</script>

<main>
  {#if showConfirmation}
    <div
      transition:slide={{ duration: 200 }}
      class="confirmation"
      style:left={positionOnRelease.x + 10 + "px"}
      style:top={positionOnRelease.y + 10 + "px"}
    >
      <button type="button" on:click={() => handleDragRelease("CP")}>
        <TablerIcon icon="copy" />
        Copy
      </button>
      <button type="button" on:click={() => handleDragRelease("MV")}>
        <TablerIcon icon="file-export" />
        Move
      </button>
      <button
        type="button"
        class="cancel"
        on:click={() => {
          closeConfirmation();
        }}
      >
        <TablerIcon icon="x" />
        Cancel
      </button>
    </div>
  {/if}

  <div
    class="drag-infos"
    class:hidden={!isDraggingFile}
    style:left={$mouseEvent?.position.x + 10 + "px"}
    style:top={$mouseEvent?.position.y + 10 + "px"}
  >
    {#if targetOnStart?.window}
      <!-- {$selectedFilesPerWindow[targetOnStart.window.uuid].length} item... -->

      <div style="display: flex; flex-direction: column;">
        {#each $selectedFilesPerWindow[targetOnStart.window.uuid] as file}
          <div style="font-size: 0.75rem;">- {file.path}</div>
        {/each}
      </div>
    {/if}
  </div>
</main>

<style lang="scss">
  .confirmation {
    position: absolute;
    z-index: 90000;

    display: flex;
    flex-direction: column;

    background-color: var(--main-color-1);
    box-shadow: #00000055 2px 2px 10px 0px;

    padding: 8px;
    gap: 4px;

    border-radius: 8px;

    // opacity: 0;

    // &.is-visible {
    //     opacity: 1;
    // }

    > button {
      display: flex;
      gap: 8px;

      // border: 1px solid #ffffff11;
      padding: 8px 16px;
      border-radius: 5px;

      &.cancel {
        color: rgb(255, 0, 0);
      }

      &:hover {
        background-color: var(--main-color-5);
        cursor: pointer;
      }
    }
  }

  .drag-infos {
    position: absolute;
    top: 0;
    left: 0;

    align-items: center;
    gap: 8px;

    padding: 6px 14px;

    background-color: var(--main-color-5);

    transition: all 0.25s ease-out;
    /* transition: opacity 0.4s ease-out; */

    border-radius: 10px;
    border: 2px solid var(--main-color-10);
    box-shadow: var(--main-color-10) 5px 5px 10px 0px;

    text-align: left;

    color: #999;
    font-size: 0.9rem;

    opacity: 1;
    /* height: 32px; */
    min-width: 120px;
    max-width: 250px;

    overflow: hidden;

    z-index: 90000;

    &.hidden {
      /* display: none; */
      opacity: 0;
      height: 0px;
      width: 0px;
    }
  }
</style>
