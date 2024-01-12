import { FastifyInstance, RegisterOptions } from "fastify";
import { createWriteStream } from "fs";
import { AnonymousFunction } from "../types";

import { MultipartFile, MultipartValue } from "@fastify/multipart";
import { error } from "npmlog";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { SETTINGS_DB } from "../global";

interface FileUploadField {
  dst: MultipartValue<string>
  filename: MultipartValue<string>
  offset: MultipartValue<number>
  chunkId?: MultipartValue<number>
  chunkRange?: MultipartValue<number>
}

//TODO: Better upload.
const CHUNKS_TO_MERGE: any[] = [];
async function idleMerge() {
  //Temporary
  if (process.env["NODE_ENV"] === "TEST") return;

  if (CHUNKS_TO_MERGE.length === 0) {
    setTimeout(() => {
      idleMerge();
    }, 500);
    return;
  }

  const current = CHUNKS_TO_MERGE.pop();

  try {
    const stream = createWriteStream(
      current.dstPath,
      {
        start: current.offset,
        flags: "a",
      }
    );

    const read = Readable.from(current.data);
    await pipeline(read, stream);

  } catch (err) {
    error("Idle Merger", err);
  }

  return idleMerge();
}

(() => {
  idleMerge();
})();

// idleMerge();

async function handeMultichunksMemory(file: MultipartFile, fields: FileUploadField) {
  const filename = fields.filename.value;
  const dst = fields.dst.value;
  const offset = +fields.offset.value;
  const dstPath = path.join(dst, filename);

  CHUNKS_TO_MERGE.push({
    data: [await file.toBuffer()],
    offset,
    dstPath
  });
}

export default function (fastify: FastifyInstance, _options: RegisterOptions, done: AnonymousFunction) {
  fastify.post("/", async function (request, _response) {
    const uploadSettings = SETTINGS_DB.cachedSettings.uploadSettings;

    const file = await request.file();
    const fields = file.fields as any as FileUploadField;

    if (uploadSettings.maxConcurrentChunks > 1) {
      await handeMultichunksMemory(file, fields);
      return {};
    }

    const dst = fields.dst.value;
    const offset = +fields.offset.value;
    const filename = fields.filename.value;

    const dstPath = path.join(dst, filename);

    await pipeline(file.file, createWriteStream(dstPath, {
      start: offset,
      flags: "a",
    }));

    return {};
  });

  done();
}
