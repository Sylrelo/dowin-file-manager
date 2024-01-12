import crypto from "crypto";
import { FastifyInstance, RegisterOptions } from "fastify";
import { rename, rm } from "fs/promises";
import path from "path";
import { FsCopy } from "../Services/copy";
import { CreateEmptyFile, CreateEmptyFolder } from "../Services/create_filefolder";
import { FsMove } from "../Services/move";
import { ReadDirSize } from "../Services/read_dir_infos";
import { BadRequest } from "../errorHandler";
import { FS_PROGRESS } from "../global";
import { AnonymousFunction, Request } from "../types";


export class Aborter {
  aborted: boolean = false;

  abort() {
    this.aborted = true;
  }
}
const CANCELLABLE: { [key: string]: Aborter } = {};

export default function (fastify: FastifyInstance, _options: RegisterOptions, done: AnonymousFunction) {
  fastify.post("/", async function (request, _response) {
    const { type, src } = request.body as any;
    let newName = "";

    if (type === "file") {
      newName = await CreateEmptyFile(src);
    } else if (type === "folder") {
      newName = await CreateEmptyFolder(src);
    } else {
      throw new BadRequest("Invalid type.");
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