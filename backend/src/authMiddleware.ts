import fp from "fastify-plugin";
import { Request } from "./types";
import { SESSIONS, USER_DB } from "./global";
import { PATH_PREFIX } from "./entry";

export default fp(function (fastify, _options, done) {
  fastify.decorateRequest("userUuid", "");
  fastify.decorateRequest("userRole", "");

  fastify.addHook("onRequest", async function (request: Request, response) {
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
      response.code(401);
      return { message: "Missing header." };
    }

    const bearerToken = authHeader.slice(7);
    const session = SESSIONS?.[bearerToken];

    if (session == null) {
      response.code(401);
      return { message: "Invalid session." };
    }

    const user = await USER_DB.getOne(session.userUuid);
    if (user == null) {
      response.code(401);
      return { message: "Invalid user." };
    }

    request.userUuid = session.userUuid;
    request.userRole = user.role;


    return {};
  });

  done();
});
