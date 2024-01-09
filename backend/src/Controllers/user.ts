import { FastifyInstance, RegisterOptions } from "fastify";
import { AnonymousFunction, Request } from "../types";
import { SESSIONS, USER_DB } from "../global";
import crypto from "crypto";
import { User } from "../Database/userDb";

export default function (
  fastify: FastifyInstance,
  _options: RegisterOptions,
  done: AnonymousFunction
) {

  fastify.get("/me", async function (request: Request, _response) {
    return { uuid: request.userUuid };
  });

  fastify.get("/", async function (request: Request, response) {

    if (request.userRole !== "ADMIN") {
      response.code(403);
      return {};
    }

    return await USER_DB.getAll();
  });

  fastify.post("/", async function (request: Request, response) {
    if (request.userRole !== "ADMIN") {
      response.code(403);
      return {};
    }

    const { username, password, role } = request.body as Partial<User>;

    const createdUser = await USER_DB.create(username, password, role);

    return createdUser;
  });

  fastify.delete("/:uuid", async function (request: Request, response) {
    if (request.userRole !== "ADMIN") {
      response.code(403);
      return {};
    }

    await USER_DB.delete(request.params["uuid"]);
    return {};
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
      userUuid,
    };

    return {
      authToken, userUuid
    };
  });

  done();
}