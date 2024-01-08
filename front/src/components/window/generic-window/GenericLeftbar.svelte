<script lang="ts">
</script>

<main>
  <div class="leftbar">
    <slot />
  </div>
</main>

<style lang="scss">
  .leftbar {
    position: absolute;

    left: 4px;

    width: calc(var(--leftbar-w) - 4px);
    height: calc(100% - var(--titlebar-h) - 4px);

    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 4px;

    border-radius: 5px 0px 0px 5px;
    overflow: hidden;

    // background-color: var(--main-color-0);
  }
</style>
