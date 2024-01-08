<script lang="ts"></script>

<div class="toolbar">
  <slot />
</div>

<div style="margin-bottom: 28px" />

<style lang="scss">
  .toolbar {
    position: absolute;

    display: flex;
    align-items: center;

    // border-radius: 5px 5px 0px 0px;

    top: -0;
    left: 0;

    padding: 4px;

    // left: var(--leftbar-w);
    width: calc(100% - 8px);
    height: calc(var(--toolbar-h) - 8px);

    background-color: var(--main-color);
    // background-color: var(--main-color-alpha-5);
    // backdrop-filter: blur(var(--primary-blur-strength));
    z-index: 10;

    // box-shadow: #000 0px 0px 15px 0px;
  }
</style>
