<script lang="ts">
  export let title: string = "";
  export let color: "info" | "error" | "warning" = "info";

  export let maxw: boolean = false;
</script>

<div class="info-box color-{color}" class:maxw>
  {#if title}
    <div>{title}</div>
  {/if}
  <slot />
</div>

<style lang="scss">
  .info-box {
    padding: 4px 8px;
    background-color: var(--main-color-4);
    width: fit-content;
    border-radius: 5px;
    font-size: 0.85rem;

    text-align: left;

    &.maxw {
      width: 100%;
    }

    &.color-info {
      background-color: #18575c;
    }
    &.color-error {
      background-color: #5c1818;
    }
    &.color-warning {
      background-color: #5b5c18;
    }
  }
</style>
