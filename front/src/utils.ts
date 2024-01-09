export const sleep = (time: number): Promise<void> => {
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

export enum NumberFormatType {
    Number,
    Size
}

const numberPostfix = [
    ["k", "m", "b", "t"],
    ["K", "M", "G", "T"],
]
export function formatNumber(num: number | undefined, precision: number = 1, type: NumberFormatType = NumberFormatType.Number) {
    if (num === 0 || num == null || isNaN(num)) {
        return "-"
    }

    let result = num.toString();

    const div = (n: number, post: string) => {
        if (num > n) result = `${(num / n).toFixed(precision)} ${post}`;
    };

    div(1000, numberPostfix[type][0]);
    div(1000000, numberPostfix[type][1]);
    div(1000000000, numberPostfix[type][2]);
    div(1000000000000, numberPostfix[type][3]);

    return result;
}

export const sizeFormatter = (size: number | undefined): string => {
    return formatNumber(size, 1, NumberFormatType.Size);
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
