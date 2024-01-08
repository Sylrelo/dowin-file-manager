<script lang="ts">
  import TablerIcon from "../../Icons/TablerIcon.svelte";

  export let label: string = "";
  export let ticon: string = "";

  export let active: boolean = false;
</script>

<button class="leftbar-item" on:click class:active>
  {#if ticon}
    <TablerIcon icon={ticon} />
  {/if}
  <div>{label}</div>
</button>

<style lang="scss">
  .leftbar-item {
    all: unset;

    display: flex;
    align-items: center;

    gap: 4px;

    padding: 4px 8px;
    width: calc(100% - 8px - 8px - 4px);

    font-size: 0.8rem;

    border-radius: 3px;

    // border: 1px inset red;

    &:hover {
      background-color: var(--main-color-5);
      cursor: pointer;
    }

    &.active {
      background-color: var(--main-color-4);
      // font-weight: bold;
    }
  }
</style>
