import process from "process";

import Fastify from "fastify";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";

import { default as DirController } from "./Controllers/dir";
import { default as FsController } from "./Controllers/fs";
import { default as UploadController } from "./Controllers/upload";
import { default as UserController } from "./Controllers/user";
import { default as BookmarkController } from "./Controllers/bookmarks";

import log from "npmlog";
import authMiddleware from "./authMiddleware";

const fastify = Fastify({
  logger: false
});

fastify.register(multipart, {
  limits: {
    fileSize: 100 * 1000 * 1000
  },
});

fastify.register(cors, {
  origin: "*"
});



fastify.register(authMiddleware);

fastify.register(DirController, { prefix: "/dir" });
fastify.register(FsController, { prefix: "/fs" });
fastify.register(UploadController, { prefix: "/upload" });
fastify.register(UserController, { prefix: "/users" });
fastify.register(BookmarkController, { prefix: "/bookmarks" });


(async () => {
  try {
    let lastMem = 0;


    setInterval(() => {
      const memUsage = process.memoryUsage();
      const currentMem = Math.round(memUsage.rss / 1000 / 1000);
      if (Math.abs(lastMem - currentMem) >= 10) {
        log.info("Memory usage", currentMem + " Mb");
        lastMem = currentMem;
      }
    }, 1 * 1000);

    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
