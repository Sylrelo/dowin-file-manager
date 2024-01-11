<script lang="ts">
  import { mouseButtonEvent } from "../events/MouseButton";
  import { mouseEvent } from "../events/MouseMovement";
  import { CurrentDrag, currentDrag, windowsNew } from "../stores/global";

  $: if ($mouseButtonEvent.primary && mouseButtonEvent.value.target?.window) {
    const uuid = mouseButtonEvent.value.target.window.uuid as string;
    const current = $windowsNew.find((w) => w.uuid === uuid)!;
    current.setForeground();
  }

  /* ---------------------------------- MOVE ---------------------------------- */

  $: if (
    false == $mouseButtonEvent.primary &&
    $mouseButtonEvent.originalTarget?.isWindowTitlebar
  ) {
    currentDrag.set(CurrentDrag.None);
  }

  $: if (
    true == $mouseButtonEvent.primary &&
    $mouseButtonEvent.target?.isWindowTitlebar &&
    $mouseEvent
  ) {
    const winTarget = $mouseButtonEvent.target.window?.element!;

    currentDrag.set(CurrentDrag.Window);

    winTarget.style.top =
      +winTarget.style.top.slice(0, -2) + $mouseEvent.movement.y * 0.8 + "px";

    winTarget.style.left =
      +winTarget.style.left.slice(0, -2) + $mouseEvent.movement.x * 0.8 + "px";
  }

  /* --------------------------------- RESIZE --------------------------------- */

  $: if (
    false == $mouseButtonEvent.primary &&
    $mouseButtonEvent.originalTarget?.isWindowResizeZone
  ) {
    currentDrag.set(CurrentDrag.None);
  }

  $: if (
    true == $mouseButtonEvent.primary &&
    $mouseButtonEvent.target?.isWindowResizeZone &&
    $mouseEvent
  ) {
    const winTarget = $mouseButtonEvent.target.window?.element!;

    currentDrag.set(CurrentDrag.Window);

    const cw = +winTarget.style.width.slice(0, -2);
    const ch = +winTarget.style.height.slice(0, -2);
    const newSizeX = Math.max(800, cw + $mouseEvent.movement.x);
    const newSizeY = Math.max(400, ch + $mouseEvent.movement.y);
    winTarget.style.width = newSizeX + "px";
    winTarget.style.height = newSizeY + "px";
  }
</script>
