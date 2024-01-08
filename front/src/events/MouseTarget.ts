import { getParentElementByClassname } from "../utilities/element";
import CustomEventClass from "./_CustomEventClass";

interface ContentTarget {
    path: string,
    element: HTMLElement
}

export interface WindowTarget {
    path: string,
    uuid: string,

    element: HTMLElement

    //TODO :
    //isResizeZone: boolean
    //isTitlebar: boolean
}

export interface FileTarget {
    path: string,
    uuid: string,

    type?: string | null

    element: HTMLElement
}

export class MouseTarget {
    #target: HTMLElement | null = null;

    constructor(target: HTMLElement | null) {
        this.#target = target;
    }

    get rawTarget(): HTMLElement | null {
        return this.#target;
    }

    get isWindowTitlebar(): boolean {
        const element = this.getElementByClassname("titlebar");

        return null != element;
    }

    get isWindowResizeZone(): boolean {
        const element = this.getElementByClassname("window-resize-zone");

        return null != element;
    }

    get content(): ContentTarget | null {

        const element = this.getElementByClassname("content");
        if (null == element) return null;

        return {
            path: element.getAttribute("data-path")!,
            element
        };
    }

    get window(): WindowTarget | null {
        const element = this.getElementByClassname("window-container");
        if (null == element) return null;

        return {
            path: element.getAttribute("data-path")!,
            uuid: element.getAttribute("data-uuid")!,
            element
        };
    }

    get file(): FileTarget | null {
        const element = this.getElementByClassname("file");
        if (null == element) return null;

        return {
            path: element.getAttribute("data-path")!,
            uuid: element.getAttribute("data-uuid")!,
            type: element.getAttribute("data-type"),
            element
        };
    }

    private getElementByClassname(classnames: string | string[]) {
        if (undefined == this.#target)
            return null;

        const element = getParentElementByClassname(this.#target, classnames);
        if (null == element)
            return null;

        return element;
    }
}

class MouseTargetEvent extends CustomEventClass<MouseTarget> {

    get isWindowTitlebar(): boolean {
        return this.value.isWindowTitlebar
    }

    get isWindowResizeZone(): boolean {
        return this.value.isWindowResizeZone;
    }


    get content() {
        return this.value.content;
    }

    get file() {
        return this.value.file;
    }

    get window() {
        return this.value.window;
    }
}

export const mouseTarget = new MouseTargetEvent();