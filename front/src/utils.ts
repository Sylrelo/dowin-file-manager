export const sleep = (time: number): Promise<void> => {
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

export const sizeFormatter = (size: number | undefined): string => {
    if (size === 0 || size == null || isNaN(size)) {
        return "--"
    }

    let result = size.toString();

    const div = (n: number, post: string) => {
        if (size > n) result = `${(size / n).toFixed(2)} ${post}`;
    };

    result = `${size} B`;

    div(1000, "KB");
    div(1000000, "MB");
    div(1000000000, "GB");

    return result;
};

export const getNameBeforeLastSlash = (name: string): string => {
    if (name.length > 1 && name.endsWith("/")) {
        name = name.slice(0, -1);
    } else {
        name = name.slice(
            name.lastIndexOf("/") + 1,
        );
    }

    return name;
}

export const hexToRgb = (hex: string): number[] => {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return [r, g, b];
};

export function componentToHex(c: number) {
    var hex = Math.round(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(rgb: number[]) {


    return (
        componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2])
    );
}
