<script lang="ts">
  import TablerIcon from "../Icons/TablerIcon.svelte";

  // export let state: boolean = false;
  // export let value: string = "";

  export let defaultValue: boolean = false;
</script>

<label class="switch">
  <input type="checkbox" checked={defaultValue} on:click />
  <span class="slider"></span>
</label>

<style lang="scss">
  .switch {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 22px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #f3412177;
    transition: 0.2s;
    border-radius: 30px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 4px;
    bottom: 4px;
    background-color: #ffffff;
    transition: 0.2s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #21f37c77;
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #21f37c77;
  }

  input:checked + .slider:before {
    transform: translateX(26px);
  }
</style>
