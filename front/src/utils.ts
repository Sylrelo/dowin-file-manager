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