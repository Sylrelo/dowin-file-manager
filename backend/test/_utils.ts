import { HTTPMethods } from "fastify";
import { fastifyServer } from "../src/fastify";
import { AUTH_TOKEN } from "./_authenticate";

export async function makeRequest(method: HTTPMethods, url: string, body: any = undefined) {
  return fastifyServer.inject({
    method: method as any,
    url,
    body,
    headers: {
      authorization: "Bearer " + AUTH_TOKEN
    }
  });
}