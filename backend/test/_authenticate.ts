
import { fastifyServer } from "../src/fastify";
import { sleep } from "../src/global";

export let AUTH_TOKEN = "";

export async function authenticate() {
  await fastifyServer.inject({ method: "get", url: "/" });
  await sleep(1000);
  console.log("Init done.");

  const response = await fastifyServer.inject({
    method: "post",
    url: "/api/users/login",
    body: {
      username: "TEST_USER",
      password: "TEST_PASSWORD"
    }
  });

  AUTH_TOKEN = JSON.parse(response.body)["authToken"];
}