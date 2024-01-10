import fp from "fastify-plugin";
import { Request } from "./types";
import { PATH_PREFIX, SESSIONS, SESSION_TIMEOUT, USER_DB } from "./global";
import { Unauthorized } from "./errorHandler";
import { error } from "npmlog";

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
      error("Auth", "Missing auth header.");
      throw new Unauthorized("Missing auth header.");
    }

    const bearerToken = authHeader.slice(7);
    const session = SESSIONS?.[bearerToken];

    if (session == null) {
      error("Auth", "Invalid session.");
      throw new Unauthorized("Invalid session.");
    }

    if (
      session.userAgent !== (request.headers["user-agent"] ?? "") ||
      session.ip !== request.ip
    ) {
      error("Auth", "Session mismatch.");
      throw new Unauthorized("Session mismatch.");
    }

    if (Date.now() - session.createdAt >= SESSION_TIMEOUT) {
      error("Auth", "Expired session.");
      throw new Unauthorized("Expired session.");
    }

    const user = await USER_DB.getOne(session.userUuid);
    if (user == null) {
      error("Auth", "Invalid user.");
      throw new Unauthorized("Invalid user.");
    }

    request.userSessionId = bearerToken;
    request.userUuid = session.userUuid;
    request.userRole = user.role;

    return {};
  });

  done();
});
