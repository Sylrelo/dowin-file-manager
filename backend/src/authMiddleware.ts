import fp from "fastify-plugin";
import { Request } from "./types";
import { SESSIONS, USER_DB } from "./global";

export default fp(function (fastify, _options, done) {
  fastify.decorateRequest("userUuid", "");
  fastify.decorateRequest("userRole", "");
  // fastify.decorateRequest("userSession", {});

  fastify.addHook("onRequest", async function (request: Request, response) {

    //TODO: REMOVE DEBUG
    // return;


    if (request.url.endsWith("users/login")) {
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
