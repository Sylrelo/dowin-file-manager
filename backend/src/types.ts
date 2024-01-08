import { FastifyRequest } from "fastify";

export type AnonymousFunction = (...params: any) => void;

export interface Request extends FastifyRequest {
  userUuid: string
}