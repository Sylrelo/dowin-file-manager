import { Test } from "@tapjs/test";
import { fastifyServer } from "../src/fastify";
import tap from "tap";
import { sleep } from "../src/global";

async function denyAccess(t: Test, url: string) {
  const response = await fastifyServer.inject({
    method: "GET",
    url: url
  });

  t.equal(response.statusCode, 401);
}

tap.test("Test Auth Middleware Enabled", async t => {
  t.plan(4);
  await fastifyServer.inject({
    method: "GET",
    url: "/"
  });
  await sleep(2000);

  await denyAccess(t, "/settings");
  await denyAccess(t, "/bookmarks");
  await denyAccess(t, "/users");
  await denyAccess(t, "/dir");

});


