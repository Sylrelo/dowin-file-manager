import { FastifyInstance, RegisterOptions } from "fastify";
import { createReadStream, createWriteStream } from "fs";
import { AnonymousFunction } from "../types";

import { MultipartFile, MultipartValue } from "@fastify/multipart";
import { rename, unlink, writeFile } from "fs/promises";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { ReadDir } from "../Services/read_dir";
import { info } from "npmlog";
import { FileExists } from "../Services/utils";

const pump = promisify(pipeline);

interface FileUploadField {
  dst: MultipartValue<string>
  filename: MultipartValue<string>
  offset: MultipartValue<number>
  chunkId?: MultipartValue<number>
  chunkRange?: MultipartValue<number>
}

const MERGE_TIMEOUT: { [key: string]: NodeJS.Timeout } = {};

async function handeMultichunks(file: MultipartFile, fields: FileUploadField) {
  const dst = fields.dst.value;

  const chunkId = +fields.chunkId.value;
  const chunkRangeMin = (+fields.chunkRange.value >> 16) & 0xFFFF;
  const chunkRangeMax = +fields.chunkRange.value & 0xFFFF;

  const filename = fields.filename.value;
  const dstPath = path.join(dst, filename);
  // Overwrite existing file if it already exists.
  if (chunkId === 0 && await FileExists(dstPath)) {
    info("Upload", "Overwriting " + filename);
    await writeFile(dstPath, "");
  }

  const timeoutKey = path.join(dst, `${chunkRangeMin}-${chunkRangeMax}-${filename}`);
  const tmpName = filename + `.chunkpart-${chunkRangeMin}-${chunkRangeMax}-${fields.chunkId.value}-pending`;
  const dstPathTmp = path.join(dst, tmpName);

  await pump(file.file, createWriteStream(dstPathTmp));
  await rename(dstPathTmp, dstPathTmp.slice(0, -8) + "-done");

  let availableFiles = await ReadDir(dst, { ignoreMetadata: true });
  availableFiles = availableFiles.filter(
    f => f.name.startsWith(filename)
      && f.name.includes(`.chunkpart-${chunkRangeMin}-${chunkRangeMax}`)
      && f.name.endsWith("-done")
  );

  if (availableFiles.length === 0 || chunkRangeMax - chunkRangeMin !== availableFiles.length) {
    return;
  }

  if (timeoutKey in MERGE_TIMEOUT) {
    clearTimeout(MERGE_TIMEOUT[timeoutKey]);
  }

  MERGE_TIMEOUT[timeoutKey] = setTimeout(async () => {
    availableFiles = availableFiles.sort((a, b) => {
      const aSplit = a.name.slice(a.name.lastIndexOf(".chunkpart-") + 11).split("-");
      const bSplit = b.name.slice(b.name.lastIndexOf(".chunkpart-") + 11).split("-");

      return +aSplit[2] - +bSplit[2];
    });

    for (const file of availableFiles) {
      info("Chunk Merge", chunkRangeMax - chunkRangeMin, file.fullPath);
      const stream = createReadStream(file.fullPath);
      await pump(stream, createWriteStream(dstPath, {
        flags: "a",
      }));
      await unlink(file.fullPath);
    }

    delete MERGE_TIMEOUT[timeoutKey];
  }, 200);
}

export default function (fastify: FastifyInstance, _options: RegisterOptions, done: AnonymousFunction) {
  fastify.post("/", async function (request, _response) {
    const file = await request.file();
    const fields = file.fields as any as FileUploadField;

    if (fields.chunkRange) {
      await handeMultichunks(file, fields);
      return {};
    }

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
