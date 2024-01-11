<script lang="ts">
  import { getContext, onMount } from "svelte";
  import Infobox from "../../../Infobox.svelte";
  import type { SettingsWindow } from "../SettingWindow";
  import { Http } from "../../../../http";

  const win: SettingsWindow = getContext("win");
  const { isBusy, path } = win.context;

  const data = {
    label: "",
    path: "",
  };

  async function addMount() {
    try {
      isBusy.set(true);
      await Http.post("mounts", data);

      path.set("/mounts");
    } catch (err) {
      console.error(err);
    } finally {
      isBusy.set(false);
    }
  }

  onMount(() => {
    win.setFn("add", addMount);
  });
</script>

<div>
  <form>
    <Infobox>
      TODO: <br />
      - Design<br />
      - Folder Selector Modal<br />
      - SMB Mount<br />
      - NFS Mount
    </Infobox>

    <div>
      <label for="label">Label</label>
      <input id="label" type="text" bind:value={data.label} />
    </div>
    <div>
      <label for="path">Path</label>
      <input id="path" type="text" bind:value={data.path} />
    </div>
  </form>
</div>

<style lang="scss"></style>
