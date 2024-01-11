import { FastifyInstance, RegisterOptions } from "fastify";
import crypto from "crypto";
import { FsCopy } from "../Services/copy";
import { FS_PROGRESS } from "../global";
import { ReadDirSize } from "../Services/read_dir_infos";
import { mkdir, rename, rm, writeFile } from "fs/promises";
import path from "path";
import { AnonymousFunction, Request } from "../types";
import { FsMove } from "../Services/move";
import { BadRequest } from "../errorHandler";
import { FsContent, ReadDir } from "../Services/read_dir";


export class Aborter {
  aborted: boolean = false;

  abort() {
    this.aborted = true;
  }
}
const CANCELLABLE: { [key: string]: Aborter } = {};

//TODO: Move to a service
function getNextName(current: FsContent[], startWith: string): string {
  const existing = current.find(d => d.name.startsWith(startWith));
  if (existing) {
    const tmp = existing.name.slice(existing.name.lastIndexOf(" ") + 1);

    if (tmp !== "file" && tmp !== "folder")
      return startWith + " " + (+tmp + 1).toString();
    else
      return startWith + " " + "1";
  }
  return startWith;
}

export default function (fastify: FastifyInstance, _options: RegisterOptions, done: AnonymousFunction) {

  //TODO: Move to a service
  fastify.post("/", async function (request, _response) {
    const { type, src } = request.body as any;

    let startWith = "New folder";
    if (type === "file") {
      startWith = "New file";
    }

    let current = await ReadDir(src, { ignoreMetadata: true });
    current = current.filter(d => d.name === startWith || d.name.startsWith(startWith + " "));
    current.sort((a, b) => {
      const aVal = a.name.slice(a.name.lastIndexOf(" ") + 1);
      const bVal = b.name.slice(b.name.lastIndexOf(" ") + 1);
      let compareResult = null;

      if (Number(aVal) && Number(bVal)) {
        compareResult = +bVal - +aVal;
      }

      return compareResult != null ? compareResult : b.name.localeCompare(a.name);
    });

    let newName = "";

    if (type === "file") {
      newName = getNextName(current, startWith);
      await writeFile(
        path.join(src, newName), ""
      );
    } else if (type === "folder") {
      newName = getNextName(current, startWith);
      await mkdir(path.join(src, newName));
    } else {
      throw new BadRequest("Invalid input");
    }

    return { name: newName };
  });


  fastify.get("/infos", async function (request: Request, _response) {
    const dir = request.query["dir"];
    const detailled = request.query["detailled"];

    return await ReadDirSize(dir, {
      detailled: detailled != undefined
    });
  });

  fastify.post("/rm", async function (request, response) {
    const src = request.body["src"];

    if (src == null) {
      response.code(422);
      return {};
    }

    await rm(src, {
      recursive: true,
      maxRetries: 4,
    });

    return {};
  });

  fastify.post("/rename", async function (request, response) {
    const dir = request.body?.["path"] as string;
    const oldName = request.body?.["oldName"] as string;
    const newName = request.body?.["newName"] as string;

    if (dir == null || oldName == null || newName == null) {
      response.code(422);
      return {};
    }


    if (oldName.includes("/") || newName.includes("/")) {
      response.code(422);
      return {
        message: "Invalid"
      };
    }

    const srcPath = path.join(dir, oldName);
    const dstPath = path.join(dir, newName);

    await rename(srcPath, dstPath);

    return {};
  });

  fastify.post("/cancel/:uuid", async function (request, _response) {
    const uuid = request.params["uuid"];

    CANCELLABLE[uuid]?.abort();
    delete CANCELLABLE[uuid];

    return {};
  });

  fastify.get("/progress/:uuid", async function (request, response) {
    const uuid = request.params["uuid"];

    const progress = FS_PROGRESS.get(uuid);

    if (progress == null) {
      response.code(404);
      return {};
    }

    return progress;
  });


  fastify.post("/mv", async function (request, _response) {
    const body = request.body as any;

    if (!body.src || !body.dst) {
      return {};
    }

    const uuid = crypto.randomUUID();
    const folderInfos = await ReadDirSize(body.src);

    FS_PROGRESS.init(uuid, folderInfos);

    CANCELLABLE[uuid] = new Aborter();
    FsMove(body.src, body.dst, {
      overwrite: true,
      isCancelled: CANCELLABLE[uuid],
      onProgress: function (progress) {
        FS_PROGRESS.updateProgress(uuid, progress);
      }
    });

    return {};
  });


  fastify.post("/cp", async function (request, _response) {
    const body = request.body as any;

    if (!body.src || !body.dst) {
      return {};
    }

    const uuid = crypto.randomUUID();
    const folderInfos = await ReadDirSize(body.src);


    FS_PROGRESS.init(uuid, folderInfos);

    CANCELLABLE[uuid] = new Aborter();
    FsCopy(body.src, body.dst, {
      onProgress: function (progress) {
        FS_PROGRESS.updateProgress(uuid, progress);
      },
      isCancelled: CANCELLABLE[uuid]
    });

    return { uuid, folderInfos };
  });

  done();
}