export const getParentElementByClassname = (element: HTMLElement, classname: string | string[]): undefined | HTMLElement => {
    let target = element;
    let result = undefined;

    if (false == Array.isArray(classname)) {
        classname = [classname as string];
    }

    if (target == null)
        return undefined;

    for (let i = 0; i < 20; i++) {

        if (target.classList == null) break;

        if ((classname as string[]).every(name => target.classList.contains(name))) {
            result = target
            break;
        }

        if (target.parentElement == null) {
            break;
        }

        target = target.parentElement;
    }

    return result;
}