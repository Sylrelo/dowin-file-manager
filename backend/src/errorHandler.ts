import { FastifyReply } from "fastify";
import { Request } from "./types";

export function customErrorHandler(error: any, request: Request, reply: FastifyReply) {
  if (error instanceof HttpError) {
    reply
      .status(error.code)
      .send({ message: error.message });
  }
  else {
    reply.send(error);
  }
}

/* -------------------------------------------------------------------------- */

export class HttpError extends Error {
  code: number = 500;

  constructor(code: number, message?: string) {
    super(message);

    this.code = code;
  }
}

export class BadRequest extends HttpError {
  constructor(message?: string) {
    super(400, message);
  }
}

export class Unauthorized extends HttpError {
  constructor(message?: string) {
    super(401, message);
  }
}

export class Forbidden extends HttpError {
  constructor(message: string = "You are not allowed.") {
    super(403, message);
  }
}

export class UnprocessableContent extends HttpError {
  constructor(message?: string) {
    super(422, message);
  }
}

export class TooManyRequest extends HttpError {
  constructor(message?: string) {
    super(429, message);
  }
}
