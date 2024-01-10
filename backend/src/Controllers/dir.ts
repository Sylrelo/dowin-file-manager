import { FastifyInstance, RegisterOptions } from "fastify";
import { ReadDir } from "../Services/read_dir";


type AnonymousFunction = (...params: any) => void;

export default function (fastify: FastifyInstance, _options: RegisterOptions, done: AnonymousFunction) {
  fastify.get("/", async function (request, _response) {
    const query = request.query["q"];

    const result = await ReadDir(query ?? "/");

    for (const key in result) {
      if (key.startsWith("_")) delete result[key];
    }

    return result;
  });

  done();
}