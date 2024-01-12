<script lang="ts">
  import { SvelteComponent, setContext, type ComponentType } from "svelte";
  import GenericLeftbar from "../generic-window/GenericLeftbar.svelte";
  import LeftbarItem from "../generic-window/LeftbarItem.svelte";
  import { get } from "svelte/store";
  import Container from "../generic-window/Container.svelte";
  import { fade } from "svelte/transition";
  import type { SettingsWindow } from "./SettingWindow";

  export let win: SettingsWindow;
  setContext("win", win);

  /* -------------------------------------------------------------------------- */

  let component: ComponentType<SvelteComponent> | null = null;

  const { path } = win.context;

  const ROUTES: { [key: string]: Record<string, any> } = {
    "/users": { component: "./Settings/Users/List", title: "Users" },
    "/users/add": { component: "./Settings/Users/Add", title: "New User" },
    "/users/edit": { component: "./Settings/Users/Add", title: "Edit User" },

    "/mounts": { component: "./Settings/Mounts/List", title: "Mounts" },
    "/mounts/add": { component: "./Settings/Mounts/Add", title: "New Mount" },

    "/file-upload": {
      component: "./Settings/Settings/UploadSettings",
      title: "Upload Settings",
    },
  };

  $: if ($path) {
    onPathChange();
  }

  let rerenderKey = Date.now();

  const onPathChange = async () => {
    try {
      const currPath = get(path);

      const cpm = ROUTES[currPath];
      win.resetCtx();

      win.title = cpm.title;

      component = await win.loadComponent(cpm.component);
      rerenderKey = Date.now();
    } catch (_) {
      component = null;
    }
  };
</script>

<div>
  <GenericLeftbar>
    <!-- <div class="leftbar-separator" /> -->
    <!-- <LeftbarItem
      label="Theme"
      ticon="palette"
      active={$path == "/theme"}
      on:click={() => path.set("/theme")}
    />

    <div class="leftbar-separator" /> -->

    <LeftbarItem
      label="File upload"
      ticon="upload"
      active={$path == "/file-upload"}
      on:click={() => path.set("/file-upload")}
    />

    <div class="leftbar-separator" />

    <LeftbarItem
      label="Users"
      ticon="users"
      active={$path.startsWith("/users")}
      on:click={() => path.set("/users")}
    />

    <!-- <LeftbarItem
      label="Groups"
      ticon="lock"
      active={$path.startsWith("/groups")}
      on:click={() => path.set("/groups")}
    />

    <LeftbarItem
      label="Mounts"
      ticon="server-2"
      active={$path.startsWith("/mounts")}
      on:click={() => path.set("/mounts")}
    /> -->

    <div class="leftbar-separator" />
  </GenericLeftbar>

  <!-- /* -------------------------------------------------------------------------- */ -->

  <Container>
    {#if component}
      {#key rerenderKey}
        <div transition:fade={{ duration: 100 }} style="height: 100%">
          <svelte:component this={component}></svelte:component>
        </div>
      {/key}
    {/if}
  </Container>
</div>

<style lang="scss">
  .leftbar-separator {
    margin-left: 40px;
    width: calc(100% - 4px - 80px);
    height: 2px;
    border-radius: 5px;
    background-color: var(--main-color-5);

    margin-bottom: 5px;
    margin-top: 5px;
  }
</style>
