<script lang="ts">
  import { onMount } from "svelte";
  import { Http } from "../http";
  import { currentUser } from "../stores/global";

  let username: string = "ADMIN";
  let password: string = "ADMIN";

  let isBusy: boolean = false;

  onMount(() => {
    checkLogin();
  });

  const checkLogin = async () => {
    try {
      if (null == localStorage.getItem("ab")) {
        return;
      }

      const response = await Http.get("users/me");

      currentUser.set({});
    } catch (error: any) {
      console.error(error.message);
      currentUser.set(null);
      localStorage.removeItem("ab");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await Http.post("users/login", {
        username,
        password,
      });

      localStorage.setItem("ab", response.authToken);

      await checkLogin();
    } catch (error: any) {
      console.error(error.message);
    }
  };
</script>

<div class="container">
  <form class="login" action="#">
    <h3>Login</h3>
    <input
      type="text"
      placeholder="username"
      autocomplete="username"
      bind:value={username}
      disabled={isBusy}
    />
    <input
      type="password"
      placeholder="password"
      autocomplete="current-password"
      bind:value={password}
      disabled={isBusy}
    />
    <button type="button" on:click={handleLogin} disabled={isBusy}>Login</button
    >
  </form>
</div>

<style lang="scss">
  .container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;

    background: hsla(233, 18%, 9%, 1);
  }

  .login {
    position: relative;

    padding: 42px;

    display: flex;
    flex-direction: column;

    width: calc(500px - 42px - 42px);
    // height: calc(500px - 42px - 42px);

    gap: 24px;

    border-radius: 15px;
    background-color: var(--main-color-1);

    box-shadow: var(--main-color-6) 0px 0px 30px 0px;

    > h3 {
      font-size: 1.8rem;
      // margin: 0px;
    }

    > input,
    button {
      border-radius: 5px;
      outline: none;
      border: none;

      font-size: 1.2rem;

      background-color: var(--main-color-5);
      padding: 16px;

      transition: all 0.2s ease-out;
    }

    > button:hover {
      background-color: var(--main-color-9);
      cursor: pointer;
    }
  }
</style>
