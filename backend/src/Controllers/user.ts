import { FastifyInstance, RegisterOptions } from "fastify";
import { AnonymousFunction, Request } from "../types";
import { SESSIONS, USER_DB } from "../global";
import crypto from "crypto";

export default function (
  fastify: FastifyInstance,
  _options: RegisterOptions,
  done: AnonymousFunction
) {

  fastify.get("/me", async function (request: Request, _response) {
    return { uuid: request.userUuid };
  });

  fastify.post("/login", async function (request, response) {

    const username = request.body?.["username"];
    const password = request.body?.["password"];

    if (username == null || password == null) {
      response.code(401);
      return {};
    }

    const userUuid = await USER_DB.tryLogin(username, password);

    if (userUuid == null) {
      response.code(401);
      return {};
    }

    const authToken = Date.now() + crypto.randomBytes(512).toString("hex");

    SESSIONS[authToken] = {
      userUuid
    };

    return {
      authToken, userUuid
    };
  });

  done();
}