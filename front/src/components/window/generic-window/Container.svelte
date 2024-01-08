<script lang="ts">
  export let withLeftbar: boolean = true;
</script>

<div class="content-container" class:with-leftbar={withLeftbar}>
  <slot />
</div>

<style lang="scss">
  .content-container {
    position: absolute;
    display: block;

    // margin-top: var(--toolbar-h);

    width: calc(100% - 8px - 8px);
    margin-left: 4px;

    height: calc(100% - var(--titlebar-h) - 4px - 8px);

    background-color: var(--main-color-10);

    border-radius: 5px 5px 5px 5px;

    padding: 4px;

    overflow: auto;

    &.with-leftbar {
      width: calc(100% - var(--leftbar-w) - 4px - 8px);
      margin-left: var(--leftbar-w);
    }
  }
</style>
