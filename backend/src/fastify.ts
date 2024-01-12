
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { error } from "npmlog";
import authMiddleware from "./authMiddleware";
import { customErrorHandler } from "./errorHandler";
import path from "path";

import { default as BookmarkController } from "./Controllers/bookmarks";
import { default as DirController } from "./Controllers/dir";
import { default as FsController } from "./Controllers/fs";
import { default as UploadController } from "./Controllers/upload";
import { default as UserController } from "./Controllers/user";
import { default as SettingsController } from "./Controllers/settings";
import { PATH_PREFIX } from "./global";

/* ------------------------------ INIT FASTIFY ------------------------------ */

const fastify = Fastify({
  logger: false,
  bodyLimit: 20 * 1000 * 1000,
});

fastify.register(fastifyMultipart, {
  limits: {
    fileSize: 200 * 1000 * 1000,
  },
});

if (process.env?.["EXP_MAX_CHUNK_SIZE"] && +process.env["EXP_MAX_CHUNK_SIZE"] > 200) {
  error("Config", "EXP_MAX_CHUNK_SIZE cannot be more than 200");
  process.exit(1);
}

fastify.register(fastifyCors, {
  origin: "*"
});

fastify.register(fastifyStatic, {
  root: process.env["NODE_ENV"] === "production" ? "/front/dist" : path.join(__dirname, "../../front/dist"),
  // prefix: PATH_PREFIX,
  prefix: PATH_PREFIX === "/" ? "/" : PATH_PREFIX + "/",
});


fastify.register(authMiddleware);
fastify.setErrorHandler(customErrorHandler);

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

        str = str.replaceAll(
          "\"PATH_PREFIX\",\"\")",
          `"PATH_PREFIX","${PATH_PREFIX}")`
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

fastify.register(DirController, { prefix: path.join(PATH_PREFIX, "/api/dir") });
fastify.register(FsController, { prefix: path.join(PATH_PREFIX, "/api/fs") });
fastify.register(UploadController, { prefix: path.join(PATH_PREFIX, "/api/upload") });
fastify.register(UserController, { prefix: path.join(PATH_PREFIX, "/api/users") });
fastify.register(BookmarkController, { prefix: path.join(PATH_PREFIX, "/api/bookmarks") });
fastify.register(SettingsController, { prefix: path.join(PATH_PREFIX, "/api/settings") });


export { fastify as fastifyServer };