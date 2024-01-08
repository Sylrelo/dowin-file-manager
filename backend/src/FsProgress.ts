import { ProgressData } from "copy-file";
import { FolderInfos } from "./Services/read_dir_infos";

interface Progress {
  totalBytes: number
  writtenBytes: number
  bytesPerSec: number

  _lastTotal: number
  _totalWritten: number
  _lastWritten: number
  _lastSrc: string
  _time: number
}

export class FsProgress {
  #progress: { [key: string]: Progress } = {};

  constructor() { }

  init(uuid: string, infos: FolderInfos) {
    this.#progress[uuid] = {
      writtenBytes: 0,
      totalBytes: infos.totalSize,
      bytesPerSec: 0,

      _lastSrc: "",
      _lastTotal: 0,
      _lastWritten: 0,
      _totalWritten: 0,
      _time: 0,
    };
  }

  updateProgress(uuid: string, progress: ProgressData) {
    const curr = this.#progress[uuid];

    if (curr._lastSrc !== progress.sourcePath) {
      curr._lastSrc = progress.sourcePath;
      curr._lastWritten = 0;
    }

    curr._totalWritten += progress.writtenBytes - curr._lastWritten;
    curr._lastWritten = progress.writtenBytes;

    if (Date.now() - curr._time >= 1000) {
      curr.bytesPerSec = curr._totalWritten - curr._lastTotal;
      curr.writtenBytes = curr._totalWritten;

      curr._lastTotal = curr._totalWritten;
      curr._time = Date.now();
    }

    if (curr._totalWritten === curr.totalBytes) {
      curr.bytesPerSec = curr._totalWritten - curr._lastTotal;
      curr.writtenBytes = curr._totalWritten;

      setTimeout(() => {
        delete this.#progress[uuid];
      }, 5000);
    }
  }

  get(uuid: string): Progress | null {
    if (!(uuid in this.#progress)) {
      return null;
    }

    const curr = { ...this.#progress[uuid] };

    for (const key in curr) {
      if (key.startsWith("_")) {
        delete curr[key];
      }
    }

    return curr;
  }

}