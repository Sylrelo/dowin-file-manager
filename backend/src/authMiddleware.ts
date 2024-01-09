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
      url.endsWith("/users/login")
    ) {
      return;
    }

    const authHeader = request.headers?.authorization;


    if (authHeader == null) {
      response.code(401);
      response.send({});
      return;
    }

    const bearerToken = authHeader.slice(7);
    const session = SESSIONS?.[bearerToken];

    if (session == null) {
      response.code(401);
      response.send({});
      return;
    }

    const user = await USER_DB.getOne(session.userUuid);
    if (user == null) {
      response.code(401);
      response.send({});
      return;
    }

    request.userUuid = session.userUuid;
    request.userRole = user.role;


    return;
  });

  done();
});
