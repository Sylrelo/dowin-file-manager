<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { isCtrlPressed } from "./stores/input";
  import PathDragEvent from "./listeners/FileDrag.svelte";
  import { windowsNew } from "./stores/global";
  import WindowDragEvent from "./listeners/WindowDragResize.svelte";
  import FileUpload from "./listeners/FileUpload.svelte";
  import { currentUser } from "./stores/global";
  import Login from "./components/Login.svelte";
  import { mouseEvent } from "./events/MouseMovement";
  import { MouseTarget, mouseTarget } from "./events/MouseTarget";
  import { mouseButtonEvent } from "./events/MouseButton";
  import PendingJobs from "./components/PendingJobs.svelte";
  import { Vec2 } from "./utilities/Vec2";
  import { keyEvent } from "./events/Keyboard";
  import WindowsList from "./components/WindowsList.svelte";
  import BlankWindow from "./components/window/generic-window/BlankWindow.svelte";
  import FileRightClick from "./listeners/FileRightClick.svelte";

  onMount(() => {
    keyEvent.init();
    mouseButtonEvent.init();
    mouseEvent.init();
  });

  const onContextMenu = (evt: Event) => {
    evt.stopPropagation();
    evt.preventDefault();
  };

  const onMouseMove = (evt: MouseEvent) => {
    const target = evt.target as HTMLElement;

    mouseEvent.movement = new Vec2(evt.movementX, evt.movementY);
    mouseEvent.position = new Vec2(evt.clientX, evt.clientY);

    mouseTarget.value = new MouseTarget(evt.target as HTMLElement);
  };

  const onKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === "Control") {
      isCtrlPressed.set(true);
    }
  };

  const onKeyUp = (evt: KeyboardEvent) => {
    if (evt.key === "Control") {
      isCtrlPressed.set(false);
    }
  };

  onMount(() => {
    window.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    let color = "2d3142";
    // color = "422d31";
    // color = "553566";
    // color = "554433";
    // color = "077776";
    color = "222222";

    const doc = document.body.style;

    doc.setProperty(`--main-color`, "#" + color);
    for (let i = 20; i >= 5; i--) {
      doc.setProperty(
        `--main-color-${20 - i}`,
        "#" + darkenColor(color, i / 20),
      );

      doc.setProperty(
        `--main-color-alpha-${20 - i}`,
        "#" + darkenColor(color, i / 20) + "aa",
      );
    }
  });

  onDestroy(() => {
    window.removeEventListener("contextmenu", onContextMenu);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  });

  const hexToRgb = (hex: string): number[] => {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return [r, g, b];
  };

  function componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(rgb: number[]) {
    return (
      componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2])
    );
  }

  const darkenColor = (hex: string, value: number): string => {
    let rgb = hexToRgb(hex);

    rgb[0] = Math.floor(rgb[0] * value);
    rgb[1] = Math.floor(rgb[1] * value);
    rgb[2] = Math.floor(rgb[2] * value);

    return rgbToHex(rgb);
  };

  //
</script>

{#if $currentUser != null}
  <PathDragEvent />
  <WindowDragEvent />
  <FileUpload />
  <FileRightClick />

  <PendingJobs />
  <WindowsList />

  {#each $windowsNew as window (window.uuid)}
    <BlankWindow win={window} />
  {/each}
{:else}
  <Login />
{/if}
