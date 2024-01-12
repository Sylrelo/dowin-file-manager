<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { Http } from "../../../../http";

  import type { SettingsWindow } from "../SettingWindow";
  import type { User } from "../../../../interfaces";

  const win: SettingsWindow = getContext("win");

  const { selected, isBusy, path, params } = win.context;

  /* -------------------------------------------------------------------------- */

  let users: User[] = [];

  /* -------------------------------------------------------------------------- */

  onMount(async () => {
    users = [];
    let timeoutReload: any = null;

    win.setFn("del", async function (uuid: string) {
      try {
        isBusy.set(true);
        await Http.delete("users/" + uuid);
      } catch (error) {
        console.error(error);
      } finally {
        clearTimeout(timeoutReload);
        timeoutReload = setTimeout(async () => {
          await loadUsers();
          isBusy.set(false);
        }, 400);
      }
    });

    loadUsers();
  });

  /* -------------------------------------------------------------------------- */

  async function loadUsers() {
    users = await Http.get("users");
    selected.set([]);
  }
</script>

<!-- <Toolbar>
  <ToolbarButton label="Add" ticon="plus" />
</Toolbar> -->
<div class="scrollable">
  <div class="users">
    <!-- <div class="user-container" style="background-color: transparent; ">
      <div class="user" style="font-size: 0.7rem;">
        <div style="width: 33%; ">Username</div>
        <div style="width: 33%; ">Fullname</div>
        <div style="width: 20px; "></div>
      </div>
    </div> -->

    {#each users as user (user.uuid)}
      <div class="user-container">
        <div class="user">
          <div style="width: 50%; ">
            <div
              style="display: flex; gap: 4px; align-items:center; font-weight: bold; font-size: 0.9rem"
            >
              <!-- {#if user.role == 0}
                <TablerIcon icon="user-square" />
              {:else if user.role == 1}
                <TablerIcon icon="user-square-rounded" />
              {:else if user.role == 2}
                <TablerIcon icon="user" />
              {/if} -->
              {user.username}
            </div>
          </div>
          <!-- <div class="more-infos" style="width: 40%;"> -->
          <!-- <div>
              <div><TablerIcon icon="user" /></div>
              <div>{user.fullname ?? "--"}</div>
            </div>
            <div>
              <div><TablerIcon icon="mail" /></div>
              <div>todo: optionnal email</div>
            </div> -->
          <!-- </div> -->
          <div>
            <button
              type="button"
              on:click={() => {
                //TODO: regex-based routing
                params.set({
                  uuid: user.uuid,
                });
                path.set("/users/edit");
              }}>Edit</button
            >
          </div>
          <div style="width: 20px; ">
            <input type="checkbox" bind:group={$selected} value={user.uuid} />
          </div>
        </div>
        <!-- <div class="groups">
          <div>group</div>
          <div>are</div>
          <div>coming</div>
          <div>soon</div>
        </div> -->
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .scrollable {
    overflow: auto;
    height: 100%;
  }

  .users {
    display: flex;
    flex-direction: column;

    align-items: start;

    // gap: 12px;

    .user-container {
      width: calc(100% - 16px);
      margin-bottom: 8px;

      padding: 8px;
      border-radius: 5px;

      background-color: var(--main-color-6);
      &:nth-child(even) {
        background-color: var(--main-color-4);
      }

      .more-infos {
        display: flex;
        flex-direction: column;
        > div {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.85rem;
        }
      }
    }

    .groups {
      width: 100%;

      display: flex;
      flex-direction: row;

      font-size: 0.7rem;

      gap: 6px;

      > div {
        background-color: var(--main-color-1);
        padding: 2px 4px;
        border-radius: 5px;
      }
    }

    .user {
      display: flex;
      width: 100%;
      justify-content: space-between;

      // align-items: center;
      // height: 32px;

      > div {
        text-align: left;
      }
      // align-items: space-between;
    }
  }
</style>
