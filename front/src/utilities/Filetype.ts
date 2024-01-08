
enum Filemode {
  S_IFMT = 61440,
  S_IFREG = 32768,
  S_IFDIR = 16384,
  S_IFCHR = 8192,
  S_IFBLK = 24576,
  S_IFIFO = 4096,
  S_IFLNK = 40960,
  S_IFSOCK = 49152,
}

export class Filetype {
  #mode: number = 0;

  constructor(mode: number) {
    this.#mode = mode;
  }

  get isDirectory() {
    return this.check(this.#mode, Filemode.S_IFDIR);
  }

  get isFile() {
    return this.check(this.#mode, Filemode.S_IFREG);
  }

  get isSymlink() {
    return this.check(this.#mode, Filemode.S_IFLNK);
  }

  check(a: number, b: number): boolean {
    return (a & b) === b;
  }
}


/*



*/