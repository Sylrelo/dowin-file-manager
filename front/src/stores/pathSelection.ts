import { get, writable } from "svelte/store";

export interface SelectedFile {

    uuid: string,
    path: string
}
export interface SelectedFilePerWindow {
    [key: string]: SelectedFile[]
}

export const selectedFilesPerWindow = writable<SelectedFilePerWindow>({});

export const hasMultipleSelect = (winUuid: string): boolean => {
    const selected = get(selectedFilesPerWindow);

    return selected[winUuid]?.length > 1
}

export const isFileCurrentlySelected = (winUuid: string, fileUuid: string,): boolean => {

    const selected = get(selectedFilesPerWindow);

    return !!selected?.[winUuid]?.find(f => f.uuid === fileUuid)
}

export const toggleSelection = (winUuid: string, fileUuid: string, file: string) => {
    const selected = get(selectedFilesPerWindow);

    if (selected?.[winUuid] == null) {
        selected[winUuid] = [];
    }

    if (selected[winUuid].findIndex(s => s.uuid == fileUuid) != -1) {
        selected[winUuid] = selected[winUuid].filter(f => f.uuid != fileUuid);
    } else {
        selected[winUuid].push({ uuid: fileUuid, path: file })
    }

    selectedFilesPerWindow.set(selected);
}

export const singleSelectClick = (winUuid: string, fileUuid: string, file: string) => {
    const selected = get(selectedFilesPerWindow);

    if (selected?.[winUuid] == null) {
        selected[winUuid] = [];
    }

    selected[winUuid] = []
    selected[winUuid].push({ uuid: fileUuid, path: file })
    selectedFilesPerWindow.set(selected);
}

export const resetWindowSelection = (winUuid: string) => {
    const selected = get(selectedFilesPerWindow);

    if (selected?.[winUuid] == null) {
        selected[winUuid] = [];
    }
    selected[winUuid] = []
    selectedFilesPerWindow.set(selected);
}