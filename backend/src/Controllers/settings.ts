import { FastifyInstance, RegisterOptions } from "fastify";
import { AnonymousFunction } from "../types";
import { GlobalSetting } from "../Database/database";

export default function (
  fastify: FastifyInstance,
  _options: RegisterOptions,
  done: AnonymousFunction
) {
  fastify.get("/", async function (_req, _res) {

    //TODO: Replace ENV for Database
    const maxChunkSize = +(process.env["EXP_MAX_CHUNK_SIZE"] ?? 100);
    const maxConcurrentChunks = +(process.env["EXP_CONCURRENT_CHUNKS"] ?? 1);
    const maxConcurrentFileUpload = +(process.env["EXP_CONCURRENT_FILE_UPLOAD"] ?? 4);

    return {
      uploadSettings: {
        maxChunkSize,
        maxConcurrentChunks,
        maxConcurrentFileUpload,
      }
    } as GlobalSetting;
  });

  done();
}