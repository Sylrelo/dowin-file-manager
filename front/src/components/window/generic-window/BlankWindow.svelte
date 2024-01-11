<script lang="ts">
  import { onMount, type ComponentType, type SvelteComponent } from "svelte";
  import { fade, scale } from "svelte/transition";
  import { activeWindow } from "../../../stores/global";
  import TablerIcon from "../../Icons/TablerIcon.svelte";
  import type { Window } from "../Window";

  export let win: Window;

  let component: ComponentType<SvelteComponent> | null = null;
  let toolbarComponent: ComponentType<SvelteComponent> | null = null;

  const loadComponent = async (
    component: string
  ): Promise<ComponentType<SvelteComponent>> => {
    const modules = import.meta.glob("../**/*.svelte");
    const module = await modules[`../${component}.svelte`]();
    return await (module as any).default;
  };

  onMount(async () => {
    component = await loadComponent(win.component);
    toolbarComponent = await loadComponent(win.toolbarComponent);
  });

  const { zindex } = win.data;
</script>

<div
  class="window-container"
  style:z-index={$zindex}
  class:is-focused={$activeWindow == win.uuid}
  data-uuid={win.uuid}
  data-type={win.constructor.name}
  style="left: 50px; top: 50px; width: 800px; height: 500px"
  in:scale={{ duration: 150 }}
  out:fade={{ duration: 150 }}
>
  <div class="window-resize-zone">
    <span>
      <TablerIcon icon="arrow-down-right" />
    </span>
  </div>
  <div class="titlebar">
    <div class="title">
      <span>
        {#if win.ticon}
          <TablerIcon icon={win.ticon} />
        {/if}
      </span>
      <span>
        {$win.title}
      </span>
    </div>
    <div class="toolbar-buttons">
      {#if toolbarComponent}
        <svelte:component this={toolbarComponent} {win}></svelte:component>
      {/if}
    </div>

    <div class="buttons">
      <button type="button" class="win-ctrl" on:click={() => win.close()}>
        <TablerIcon icon="x" />
      </button>
    </div>
  </div>
  {#if component}
    <svelte:component this={component} {win}></svelte:component>
  {/if}
</div>

<style lang="scss">
  .window-container {
    display: block;
    position: absolute;

    width: 800px;
    height: 500px;

    border-radius: 6px;

    user-select: none;
    background-color: var(--main-color);
    // background-color: var(--main-color-alpha-1);
    // backdrop-filter: blur(var((--primary-blur-strength)));

    // background-image: url("https://i.pinimg.com/originals/f6/08/db/f608dbb1fa4e1b2edc7a9fda42a9eff5.gif");
    // background-size: cover;

    box-shadow: #00000066 0px 0px 20px 0px;
    // border: 1px solid var(--main-color-1);

    left: 40px;
    top: 150px;

    &:not(.is-focused) {
      filter: brightness(0.9);
    }
    // transition: all 0.1s ease-out;

    > .window-resize-zone {
      position: absolute;
      bottom: -10px;
      right: -10px;
      width: 32px;
      height: 32px;
      z-index: 100;

      display: flex;
      justify-content: center;
      align-items: center;

      > span {
        position: relative;
        top: -6px;
        left: -6px;
        opacity: 0.5;
      }

      cursor: nwse-resize;
    }

    .titlebar {
      display: flex;

      justify-content: space-between;
      align-items: center;
      padding-left: 12px;
      padding-right: 12px;
      // gap: 4px;

      // border-radius: 10px 10px 0px 0px;
      // border: 1px solid red;
      // margin-bottom: 4px;

      height: var(--titlebar-h);
      // background-color: var(--main-color-2);

      .title {
        display: flex;
        align-items: center;
        gap: 4px;
        width: calc(var(--leftbar-w) - 12px);
        text-align: left;
        font-weight: bold;
      }

      .toolbar-buttons {
        // display: flex;
        // gap: 8px;
        flex-grow: 1;
        // margin-top: 4px;
        height: calc(100% - 16px);
        margin-right: 4px;
        // width: 100%;

        // background-color: darkred;
      }

      .buttons {
        display: flex;
        gap: 8px;

        > button.win-ctrl {
          all: unset;
          padding: 4px;
          // background-color: var(--main-color-2);
          border-radius: 3px;
          transition: background-color 0.2s ease-out;

          &:hover {
            background-color: var(--main-color-8);
            cursor: pointer;
          }
        }

        // > button {
        //   display: flex;
        //   align-items: center;
        //   justify-content: center;
        //   background-color: var(--main-color-3);
        //   width: 30px;
        //   height: 30px;
        //   border-radius: 5px;
        //   &:hover:not(:disabled) {
        //     background-color: var(--main-color-6);
        //     cursor: pointer;
        //   }
        // }
      }
    }
  }
</style>
