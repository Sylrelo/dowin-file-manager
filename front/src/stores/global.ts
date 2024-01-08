import { writable, get as svelteGet } from "svelte/store";
import type { Window } from "../components/window/Window";
import type { Bookmark } from "../interfaces";


// #######################################################

export const activeWindow = writable<string>("")

export const windowsNew = writable<Window[]>([]);


export const currentUser = writable<any | null>(null)

export const windowListTitleRefresh = writable<number>(Date.now())

export const explorerWindowRefresh = writable<[string, number]>(["", 0]);

export enum CurrentDrag {
    None,
    Window,
    File,
    Upload
}

export const currentDrag = writable<CurrentDrag>(CurrentDrag.None);

export const selectedForRename = writable<string>("");

/* ------------------------------ CACHED ROUTES ----------------------------- */

export const bookmarks = writable<{
    createdAt: number,
    bookmarks: Bookmark[]
}>({ createdAt: 0, bookmarks: [] });