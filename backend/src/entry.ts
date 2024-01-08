import log from "npmlog";
import process from "process";

import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";

import { default as BookmarkController } from "./Controllers/bookmarks";
import { default as DirController } from "./Controllers/dir";
import { default as FsController } from "./Controllers/fs";
import { default as UploadController } from "./Controllers/upload";
import { default as UserController } from "./Controllers/user";

import authMiddleware from "./authMiddleware";
import path from "path";

const fastify = Fastify({
  logger: false
});

fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 100 * 1000 * 1000
  },
});

fastify.register(fastifyCors, {
  origin: "*"
});

fastify.register(fastifyStatic, {
  root: process.env["NODE_ENV"] === "production" ? "/front/dist" : path.join(__dirname, "../../front/dist"),
});


fastify.register(authMiddleware);

/* --------------------------------- ROUTES --------------------------------- */

fastify.register(DirController, { prefix: "/dir" });
fastify.register(FsController, { prefix: "/fs" });
fastify.register(UploadController, { prefix: "/upload" });
fastify.register(UserController, { prefix: "/users" });
fastify.register(BookmarkController, { prefix: "/bookmarks" });

/* ------------------------------- SERVER MAIN ------------------------------ */

const SIGNALS = {
  "SIGHUP": 1,
  "SIGINT": 2,
  "SIGTERM": 15
};

(async () => {
  try {

    Object.keys(SIGNALS).forEach((signal) => {
      process.on(signal, () => {
        console.log(`process received a ${signal} signal`);
        // shutdown(signal, signals[signal]);
        fastify.close(() => {
          console.log(`server stopped by ${signal} with value ${SIGNALS[signal]}`);
          process.exit(128 + SIGNALS[signal]);
        });
      });
    });

    let lastMem = 0;


    setInterval(() => {
      const memUsage = process.memoryUsage();
      const currentMem = Math.round(memUsage.rss / 1000 / 1000);
      if (Math.abs(lastMem - currentMem) >= 10) {
        log.info("Memory usage", currentMem + " Mb");
        lastMem = currentMem;
      }
    }, 1 * 1000);

    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
