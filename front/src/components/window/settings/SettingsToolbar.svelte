<script lang="ts">
  import { get, type Writable } from "svelte/store";
  import ToolbarButton from "../generic-window/ToolbarButton.svelte";
  import { fade } from "svelte/transition";
  import type { SettingsWindow, UserFn } from "./SettingWindow";

  export let win: SettingsWindow;

  const { path, selected, func, isBusy } = win.context;
  const fn = func;

  let currentPath: string;

  $: if ($path) {
    currentPath = $path;
  }
</script>

<div class="allo">
  {#if currentPath == "/users"}
    <div transition:fade={{ duration: 100 }}>
      <ToolbarButton
        label="Add"
        ticon="user-plus"
        on:click={() => {
          win.context.path.set("/users/add");
        }}
      />

      <div style="margin-left: auto; display: flex; gap: 4px;">
        {#if $selected.length}
          <ToolbarButton
            label="Delete selected"
            isDisabled={$isBusy}
            ticon="user-minus"
            on:click={() => {
              for (const curr of get(selected)) {
                $fn.del(curr);
              }
            }}
          />
        {/if}
      </div>
    </div>
  {/if}

  {#if currentPath == "/users/add" || currentPath == "/mounts/add"}
    <div transition:fade={{ duration: 100 }}>
      <div style="margin-left: auto;">
        <ToolbarButton
          label="Save"
          ticon="device-floppy"
          isDisabled={$isBusy}
          on:click={() => {
            $fn.add();
          }}
        />
      </div>
    </div>
  {/if}

  <!-- /* -------------------------------------------------------------------------- */ -->

  {#if currentPath == "/mounts"}
    <div transition:fade={{ duration: 100 }}>
      <ToolbarButton
        label="Add"
        ticon="plus"
        on:click={() => {
          win.context.path.set("/mounts/add");
        }}
      />

      <div style="margin-left: auto; display: flex; gap: 4px;">
        {#if $selected.length}
          <ToolbarButton
            label="Remove selected"
            isDisabled={$isBusy}
            ticon="user-minus"
            on:click={() => {
              $fn.del();
            }}
          />
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- /* -------------------------------------------------------------------------- */ -->

<style lang="scss">
  .allo {
    position: relative;

    > div {
      position: absolute;
      display: flex;
      // justify-content: space-between;
      align-items: center;

      flex-grow: 1;

      gap: 4px;
      width: 100%;
    }
  }
</style>
