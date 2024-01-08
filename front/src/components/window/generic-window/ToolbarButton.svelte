<script lang="ts">
  import { fade } from "svelte/transition";
  import TablerIcon from "../../Icons/TablerIcon.svelte";

  export let label: string = "";
  export let ticon: string = "";

  export let isDisabled: boolean = false;
</script>

<button
  type="button"
  class="toolbar-button-item"
  disabled={isDisabled}
  transition:fade={{ duration: 80 }}
  on:click
>
  {#if ticon}
    <div>
      <TablerIcon icon={ticon} />
    </div>
  {/if}
  {#if label}
    <div>
      {label}
    </div>
  {/if}
</button>

<style lang="scss">
  .toolbar-button-item {
    all: unset;

    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;

    background-color: var(--main-color-6);
    // padding: 2px 12px;

    padding: 0px 8px;
    min-width: calc(26px - 16px);
    height: 26px;

    border-radius: 5px;
    font-size: 0.8rem;

    transition: background-color 0.2s ease-out;

    &:hover {
      background-color: var(--main-color-10);
      cursor: pointer;
    }

    &:disabled {
      background-color: var(--main-color-3);
      color: #888;
      // border: 1px solid var(--main-color-6);
      cursor: not-allowed;
    }
    // > div {
    //   background-color: darkred;
    // }
  }
</style>
