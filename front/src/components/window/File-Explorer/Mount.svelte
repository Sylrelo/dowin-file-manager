<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";

    import { Http } from "../../../http";
    import type { Bookmark } from "../../../interfaces";
    import TablerIcon from "../../Icons/TablerIcon.svelte";
    import { bookmarks } from "../../../stores/global";

    const dispatch = createEventDispatcher();

    let mounts: Bookmark[] = [];
    $: mounts = $bookmarks.bookmarks;

    onMount(async () => {
        if (Date.now() - $bookmarks.createdAt >= 20000) {
            const result = await Http.get("bookmarks");
            bookmarks.set({ createdAt: Date.now(), bookmarks: result });
        }
    });

    const subPath = (str: string): string => {
        if (str.startsWith("/manager")) {
            return str.slice(8, str.length);
        }

        return str;
    };
</script>

<div style="overflow: auto">
    {#each mounts as mount (mount.path)}
        <button
            title={mount.path}
            class="mount"
            on:click={() => dispatch("onMountChange", mount)}
        >
            <div
                style="display: flex; gap: 8px; padding: 0px 4px;"
                class="just-center"
            >
                <div class="icon">
                    {#if mount.path === "/"}
                        <TablerIcon icon="folder-root" />
                    {:else}
                        <TablerIcon icon="pin" />
                    {/if}
                </div>

                <div class="d-flex flex-col just-center" style="gap: 4px;">
                    <div class="name">{mount.name ?? subPath(mount.path)}</div>

                    {#if mount.bFree && mount.bTotal}
                        <div class="space">
                            <div
                                class="used"
                                style:width={`${
                                    (1 - Number(mount.bFree / mount.bTotal)) *
                                    100
                                }%`}
                            ></div>
                        </div>
                    {/if}
                </div>
            </div>
        </button>
    {/each}
</div>

<style lang="scss">
    .mount {
        position: relative;
        display: flex;
        flex-direction: column;

        justify-content: center;

        padding: 4px 0px;

        transition: background-color 0.2s ease-in-out;
        border-radius: 5px;

        &:hover {
            background-color: var(--main-color-4);
            cursor: pointer;
        }

        .icon {
            width: 28px;
            height: 28px;
            display: block;
            background-color: var(--main-color-5);
            border-radius: 5px;

            display: flex;
            justify-content: center;
            align-items: center;
        }

        .name {
            text-align: left;
            display: block;

            width: 125px;

            font-size: 0.8rem;

            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }

        .space {
            width: 124px;
            height: 4px;

            border-radius: 2px;

            border: 1px solid #ffffff55;
            overflow: hidden;

            > .used {
                width: 50%;
                height: inherit;
                background-color: #ffffff55;
            }
        }
    }
</style>
