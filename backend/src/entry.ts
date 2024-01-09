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

import { info } from "npmlog";
import path from "path";
import authMiddleware from "./authMiddleware";

/* --------------------------------- CONSTS --------------------------------- */

export const PATH_PREFIX = process.env?.["FM_PATH_PREFIX"] ?? "/";

/* ------------------------------ INIT FASTIFY ------------------------------ */

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
  // prefix: PATH_PREFIX,
  prefix: PATH_PREFIX === "/" ? "/" : PATH_PREFIX + "/",
});


fastify.register(authMiddleware);

/* ----------------------- HOOK FOR REVERSE-PROXY PATH ---------------------- */

// TODO: Rework
fastify.addHook("onSend", async function (req, rep, payload: any) {
  const url = req.url.replace(PATH_PREFIX, "");

  if (
    PATH_PREFIX === "/" ||
    url.startsWith("api") ||
    (url !== "" && !url.endsWith(".css")
      && !url.endsWith(".html")
      && !url.endsWith(".js")) ||
    typeof payload.on !== "function"
  ) {
    return payload;
  }

  return new Promise((resolve, reject) => {
    const chunks = [];

    payload.on("error", (err) => {
      reject(err);
    });

    payload.on("data", (data) => {
      // console.log(data);
      chunks.push(data);
    });

    payload.on("end", () => {
      let str = chunks.join("");

      const prefix = PATH_PREFIX.startsWith("/") ? PATH_PREFIX.slice(1) : PATH_PREFIX;

      if (url.endsWith("js") || url.endsWith("css")) {
        str = str.replaceAll(
          "assets/",
          prefix + "/assets/"
        );
        str = str.replaceAll(
          "/resources/",
          PATH_PREFIX + "/resources/"
        );
      } else {
        str = str.replaceAll(
          "/assets/",
          PATH_PREFIX + "/assets/"
        );
      }
      //@ts-expect-error ---
      resolve(str);
    });
  });
});

/* --------------------------------- ROUTES --------------------------------- */

fastify.get(PATH_PREFIX, function (_, res) {
  return res.sendFile("index.html");
});


fastify.register(DirController, { prefix: "/api/dir" });
fastify.register(FsController, { prefix: "/api/fs" });
fastify.register(UploadController, { prefix: "/api/upload" });
fastify.register(UserController, { prefix: "/api/users" });
fastify.register(BookmarkController, { prefix: "/api/bookmarks" });

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

    info("Start", `Using "${PATH_PREFIX}" path prefix.`);

    // let lastMem = 0;

    // setInterval(() => {
    //   const memUsage = process.memoryUsage();
    //   const currentMem = Math.round(memUsage.rss / 1000 / 1000);
    //   if (Math.abs(lastMem - currentMem) >= 10) {
    //     log.info("Memory usage", currentMem + " Mb");
    //     lastMem = currentMem;
    //   }
    // }, 1 * 1000);

    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
