import { FastifyInstance, RegisterOptions } from "fastify";
import { createWriteStream } from "fs";
import { AnonymousFunction } from "../types";

import { MultipartFile, MultipartValue } from "@fastify/multipart";
import { error } from "npmlog";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { SETTINGS_DB, sleep } from "../global";
import { FileExists } from "../Services/utils";
import { writeFile } from "fs/promises";

interface FileUploadField {
  dst: MultipartValue<string>
  filename: MultipartValue<string>
  offset: MultipartValue<number>
  chunkId?: MultipartValue<number>
  chunkRange?: MultipartValue<number>
}

const CHUNKS_TO_MERGE: any[] = [];
let idleMergeStarted = false;
let idleMergeInactiveSince: number | undefined = undefined;
async function idleMerge() {
  if (idleMergeInactiveSince === undefined && CHUNKS_TO_MERGE.length === 0)
    idleMergeInactiveSince = Date.now();

  if (CHUNKS_TO_MERGE.length === 0) {
    if (Date.now() - idleMergeInactiveSince >= 60000) {
      idleMergeInactiveSince = undefined;
      idleMergeStarted = false;
      return;
    }

    await sleep(500);
    return idleMerge();
  }

  const current = CHUNKS_TO_MERGE.pop();

  try {
    const stream = createWriteStream(
      current.dstPath,
      {
        start: current.offset,
        flags: "r+",
      }
    );

    const read = Readable.from(current.data);
    await pipeline(read, stream);

  } catch (err) {
    error("Idle Merger", err);
  }

  return idleMerge();
}

async function handeMultichunksMemory(file: MultipartFile, fields: FileUploadField) {
  const filename = fields.filename.value;
  const dst = fields.dst.value;
  const offset = +fields.offset.value;
  const dstPath = path.join(dst, filename);

  if (!await FileExists(dstPath)) {
    await writeFile(dstPath, "");
  }

  CHUNKS_TO_MERGE.push({
    data: [await file.toBuffer()],
    offset,
    dstPath
  });

  if (idleMergeStarted === false) {
    idleMergeStarted = true;
    idleMergeInactiveSince = undefined;
    idleMerge();
  }
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

    if (!await FileExists(dstPath)) {
      await writeFile(dstPath, "");
    }

    await pipeline(file.file, createWriteStream(dstPath, {
      start: offset,

      flags: "r+",
    }));

    return {};
  });

  done();
}
