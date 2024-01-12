import { FastifyInstance, RegisterOptions } from "fastify";
import { AnonymousFunction, Request } from "../types";
import { SETTINGS_DB } from "../global";
import { Forbidden } from "../errorHandler";

export default function (
  fastify: FastifyInstance,
  _options: RegisterOptions,
  done: AnonymousFunction
) {
  fastify.get("/", async function (_req, _res) {
    const settings = await SETTINGS_DB.getSettings();

    return settings;
  });

  fastify.put("/", async function (req: Request, _res) {
    if (req.userRole !== "ADMIN")
      throw new Forbidden("Admin only.");

    const settings = await SETTINGS_DB.update(req.body);
    return settings;
  });


  done();
}