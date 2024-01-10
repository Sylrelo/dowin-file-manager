import fp from "fastify-plugin";
import { Request } from "./types";
import { SESSIONS, USER_DB } from "./global";
import { PATH_PREFIX, SESSION_TIMEOUT } from "./entry";
import { Unauthorized } from "./errorHandler";

export default fp(function (fastify, _options, done) {
  fastify.decorateRequest("userUuid", "");
  fastify.decorateRequest("userRole", "");
  fastify.decorateRequest("userSessionId", "");

  fastify.addHook("onRequest", async function (request: Request, _response) {
    const url = request.url.replace(PATH_PREFIX, "");

    if (
      url === "" ||
      url === "/" ||
      url === "/favicon.ico" ||
      url.startsWith("resources/") ||
      url.startsWith("/resources/") ||
      url.startsWith("assets/") ||
      url.startsWith("/assets/") ||
      url.endsWith("/login")
    ) {
      return;
    }

    const authHeader = request.headers?.authorization;

    if (authHeader == null) {
      throw new Unauthorized("Missing auth header.");
    }

    const bearerToken = authHeader.slice(7);
    const session = SESSIONS?.[bearerToken];

    if (session == null) {
      throw new Unauthorized("Invalid session.");
    }

    if (
      session.userAgent !== (request.headers["user-agent"] ?? "") ||
      session.ip !== request.ip
    ) {
      throw new Unauthorized("Session mismatch.");
    }

    if (Date.now() - session.createdAt >= SESSION_TIMEOUT) {
      throw new Unauthorized("Expired session.");
    }

    const user = await USER_DB.getOne(session.userUuid);
    if (user == null) {
      throw new Unauthorized("Invalid user.");
    }

    request.userSessionId = bearerToken;
    request.userUuid = session.userUuid;
    request.userRole = user.role;

    return {};
  });

  done();
});
