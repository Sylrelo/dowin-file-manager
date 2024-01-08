import { FastifyInstance, RegisterOptions } from "fastify";
import { createReadStream, createWriteStream } from "fs";
import { AnonymousFunction } from "../types";

import { MultipartValue } from "@fastify/multipart";
import { constants, open, rename, unlink } from "fs/promises";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { ReadDir } from "../Services/read_dir";

const pump = promisify(pipeline);

interface FileUploadField {
  dst: MultipartValue<string>
  filename: MultipartValue<string>
  offset: MultipartValue<number>
}

interface ChunkFileUploadField extends FileUploadField {
  chunkId: MultipartValue<number>
  chunkRange: MultipartValue<number>
}

export default function (fastify: FastifyInstance, _options: RegisterOptions, done: AnonymousFunction) {

  fastify.post("/chunk", async function (request, _response) {
    const file = await request.file();
    const fields = file.fields as any as ChunkFileUploadField;

    const dst = fields.dst.value;

    const chunkRangeMin = (fields.chunkRange.value >> 8) & 255;
    const chunkRangeMax = fields.chunkRange.value & 255;

    const tmpName = file.filename + `.chunkpart-${chunkRangeMin}-${chunkRangeMax}-${fields.chunkId.value}-pending`;

    const dstPathTmp = path.join(dst, tmpName);
    const dstPath = path.join(dst, file.filename);

    await pump(file.file, createWriteStream(dstPathTmp));
    await rename(dstPathTmp, dstPath);

    let availableFiles = await ReadDir(dst);
    availableFiles = availableFiles.filter(
      f => f.name.startsWith(file.filename)
        && f.name.includes(`.chunkpart-${chunkRangeMin}-${chunkRangeMax}`)
        && !f.name.endsWith("-pending")
    );

    if (chunkRangeMax - chunkRangeMin === availableFiles.length) {
      availableFiles.sort((a, b) => a.name.localeCompare(b.name));

      for (const file of availableFiles) {
        const stream = createReadStream(file.fullPath);
        await pump(stream, createWriteStream(dstPath, {
          flags: "a",
        }));
        await unlink(file.fullPath);
      }
    }

    return {};
  });

  fastify.post("/", async function (request, _response) {
    const file = await request.file();
    const fields = file.fields as any as FileUploadField;

    const dst = fields.dst.value;
    const offset = +fields.offset.value;
    const filename = fields.filename.value;

    const dstPath = path.join(dst, filename);

    await pump(file.file, createWriteStream(dstPath, {
      start: offset,
      flags: "a",

    }));

    return {};
  });

  done();
}
