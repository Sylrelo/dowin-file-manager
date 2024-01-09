<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { Http } from "../../../../http";
  import type { SettingsWindow } from "../SettingWindow";
  import { get } from "svelte/store";

  const win: SettingsWindow = getContext("win");
  const { isBusy, params } = win.context;

  let data: Record<string, any> = {
    username: undefined,
    fullname: undefined,
    password: undefined,
    passwordConfirmation: undefined,
    role: "USER",
  };

  /* -------------------------------------------------------------------------- */

  onMount(async () => {
    const uuid = get(params)?.["uuid"];

    if (uuid) {
      const result = await Http.get("users/" + uuid);

      data.username = result.username;
      data.role = result.role;
    }

    win.setFn("add", async function () {
      try {
        if (
          !data.username ||
          (!uuid && (!data.password || !data.passwordConfirmation)) ||
          !data.role
        ) {
          console.debug("Empty payload");
          return;
        }

        isBusy.set(true);

        const postData = { ...data };
        postData.passwordConfirmation = undefined;
        // postData.role = postData.role;

        if (uuid) {
          await Http.put("users", uuid, postData);
        } else {
          await Http.post("users", postData);
        }
        win.context.path.set("/users");
      } catch (err: any) {
        console.error(err);
      } finally {
        isBusy.set(false);
      }
    });
  });
</script>

<!-- const win: SettingsWindow = getContext("win"); const func: UserFn = win.func;
const {selected} = win.context; -->
<form>
  <div>
    <label for="username">Username</label>
    <input
      id="username"
      type="text"
      bind:value={data.username}
      autocomplete="username"
    />
  </div>
  <!-- <div>
    <label for="fullname">Fullname</label>
    <input
      id="fullname"
      type="text"
      bind:value={data.fullname}
      autocomplete="given-name"
    />
  </div> -->

  <div>
    <label for="password">Password</label>
    <input
      id="password"
      type="password"
      bind:value={data.password}
      autocomplete="new-password"
    />
  </div>
  <div>
    <label for="password-confirmation">Password confirmation</label>
    <input
      id="password-confirmation"
      type="password"
      bind:value={data.passwordConfirmation}
      autocomplete="new-password"
    />
  </div>

  <div>
    <label for="role-select">Role</label>
    <select id="role-select" bind:value={data.role}>
      <option value="ADMIN">Admin</option>
      <option value="USER">User</option>
    </select>
  </div>
</form>

<style lang="scss">
  form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;

    gap: 8px;

    > div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: start;
      width: calc(100% - 8px);

      > label {
        // font-weight: bold;
        margin-bottom: 4px;
      }

      > input {
        all: unset;

        background-color: var(--main-color-0);
        color: #ccc;
        border-radius: 5px;
        padding: 4px 8px;

        width: calc(100% - 8px);

        text-align: left;
      }

      select {
        color: #ccc;
        padding: 4px 8px;
        border-radius: 5px;
        height: 32px;
        width: calc(100% + 8px);
        background-color: var(--main-color-4);
        border: 1px solid var(--main-color-0);
      }
    }
  }
</style>
