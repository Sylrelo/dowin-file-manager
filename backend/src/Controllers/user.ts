import { FastifyInstance, FastifyRequest, RegisterOptions } from "fastify";
import { AnonymousFunction, Request } from "../types";
import { BANNED_IP_TIMEOUT, SESSIONS, SESSION_TIMEOUT, USER_DB } from "../global";
import crypto from "crypto";
import { User } from "../Database/userDb";
import { BadRequest, Forbidden, TooManyRequest, Unauthorized } from "../errorHandler";

export default function (
  fastify: FastifyInstance,
  _options: RegisterOptions,
  done: AnonymousFunction
) {

  /* ----------------------------------- ME ----------------------------------- */

  fastify.get("/me", async function (request: Request, _response) {
    return { uuid: request.userUuid };
  });

  /* --------------------------------- GET ONE -------------------------------- */

  fastify.get("/:uuid", async function (request: Request, _response) {
    if (request.userRole !== "ADMIN") {
      throw new Forbidden();
    }

    return await USER_DB.getOne(request.params["uuid"]);
  });

  /* ------------------------------- DELETE ONE ------------------------------- */

  fastify.put("/:uuid", async function (request: Request, _response) {
    if (request.userRole !== "ADMIN") {
      throw new Forbidden();
    }

    return await USER_DB.updateOne(request.params["uuid"], request.body);
  });

  /* --------------------------------- GET ONE -------------------------------- */

  fastify.get("/", async function (request: Request, _response) {

    if (request.userRole !== "ADMIN") {
      throw new Forbidden();
    }

    return await USER_DB.getAll();
  });

  /* ---------------------------------- POST ---------------------------------- */

  fastify.post("/", async function (request: Request, _response) {
    if (request.userRole !== "ADMIN") {
      throw new Forbidden();
    }

    const { username, password, role } = request.body as Partial<User>;

    const createdUser = await USER_DB.create(username, password, role);

    return createdUser;
  });

  /* --------------------------------- DELETE --------------------------------- */

  fastify.delete("/:uuid", async function (request: Request, _response) {
    if (request.userRole !== "ADMIN") {
      throw new Forbidden();
    }

    await USER_DB.delete(request.params["uuid"]);
    return {};
  });

  /* ---------------------------------- LOGIN --------------------------------- */

  //TODO: Move to a service file + type.
  function generateSession(userUuid: string, request: FastifyRequest): Record<string, any> {
    const dateNow = Date.now();

    const authToken = dateNow + crypto.randomBytes(512).toString("hex");

    SESSIONS[authToken] = {
      userUuid,
      ip: request.ip,
      userAgent: request.headers["user-agent"] ?? "",
      createdAt: dateNow
    };

    return {
      authToken,
      createdAt: dateNow,
      validUntil: dateNow + SESSION_TIMEOUT,
      userUuid
    };
  }

  fastify.post("/login_refresh", async function (request: Request, _response) {
    const result = generateSession(request.userUuid, request);

    delete SESSIONS[request.userSessionId];
    return result;
  });

  fastify.post("/login", async function (request, _response) {

    const username = request.body?.["username"];
    const password = request.body?.["password"];

    //Basic blocking for invalid credentials.
    const bannedTimeout = BANNED_IP_TIMEOUT?.[request.ip];

    if (bannedTimeout && Date.now() - bannedTimeout.firstTryAt <= 60000 && bannedTimeout.try >= 3) {
      throw new TooManyRequest("Too many try. You've been temporarily blocked from login.");
    } else if (bannedTimeout && Date.now() - bannedTimeout.firstTryAt >= 60000 && bannedTimeout.try >= 3) {
      delete BANNED_IP_TIMEOUT[request.ip];
    }

    if (username == null || password == null) {
      throw new BadRequest();
    }

    const userUuid = await USER_DB.tryLogin(username, password);
    if (userUuid == null) {
      if (!(request.ip in BANNED_IP_TIMEOUT)) {
        BANNED_IP_TIMEOUT[request.ip] = {
          firstTryAt: Date.now(),
          try: 1
        };
      } else {
        BANNED_IP_TIMEOUT[request.ip].try += 1;
      }

      throw new Unauthorized("Invalid credentials.");
    }

    return generateSession(userUuid, request);
  });

  done();
}