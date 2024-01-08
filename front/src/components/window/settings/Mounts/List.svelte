<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { Http } from "../../../../http";
  import TablerIcon from "../../../Icons/TablerIcon.svelte";
  import type { SettingsWindow } from "../SettingWindow";

  const win: SettingsWindow = getContext("win");
  const { selected, isBusy } = win.context;

  let mounts: any[] = [];
  let timeoutReload: any = null;

  async function removeSelected() {
    for (const sel of $selected) {
      try {
        isBusy.set(true);
        await Http.delete("mounts/" + sel);
      } catch (_) {
      } finally {
        clearTimeout(timeoutReload);
        timeoutReload = setTimeout(async () => {
          loadMounts();
          selected.set([]);
          isBusy.set(false);
        }, 400);
      }
    }
  }

  onMount(() => {
    win.setFn("del", removeSelected);
    loadMounts();
  });

  async function loadMounts() {
    mounts = await Http.get("mounts");
  }
</script>

<div class="mount-list">
  {#each mounts as mount (mount.id)}
    <div>
      <div class="icon">
        {#if mount.icon}
          <TablerIcon icon={mount.icon} />
        {/if}
      </div>
      <div style="width: 30%">
        <div class="label">{mount.label}</div>
      </div>
      <div style="width: 50%; flex-grow: 1;">
        <div class="path">{mount.path}</div>
      </div>
      <!-- <div class="action" style="margin-left: auto;">
        <Switch />
      </div> -->
      <div style="width: 20px;">
        <input type="checkbox" bind:group={$selected} value={mount.id} />
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  .mount-list {
    display: flex;
    flex-direction: column;
    // align-items: center;

    gap: 8px;

    > div {
      display: flex;
      align-items: center;
      gap: 8px;

      padding: 4px 8px;
      width: calc(100% - 16px);
      min-height: 36px;

      border-radius: 5px;

      background-color: var(--main-color-6);

      &:nth-child(even) {
        background-color: var(--main-color-4);
      }

      .icon {
        width: 28px;
        height: 28px;
        // border-radius: inherit;
      }

      .label,
      .path {
        font-size: 0.9rem;
        background-color: var(--main-color-10);
        padding: 0px 8px;
        border-radius: 5px;
        width: fit-content;
        text-align: left;
      }

      .path {
        font-size: 0.75rem;
      }
      // .label {
      //   background-color: var(--main-color-1);
      //   padding: 0px 8px;
      //   border-radius: inherit;
      // }
    }
  }
</style>
