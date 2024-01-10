import process from "process";
import { info } from "npmlog";
import { fastifyServer } from "./fastify";
import { BANNED_IP_TIMEOUT, PATH_PREFIX, SESSIONS, SESSION_TIMEOUT } from "./global";

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
        fastifyServer.close(() => {
          console.log(`server stopped by ${signal} with value ${SIGNALS[signal]}`);
          process.exit(128 + SIGNALS[signal]);
        });
      });
    });

    info("Start", `Using "${PATH_PREFIX}" path prefix.`);

    setInterval(() => {
      for (const key in SESSIONS) {
        if (Date.now() >= SESSIONS[key].createdAt + SESSION_TIMEOUT) {
          info("Session Cleaner", "Cleaning " + key);
          delete SESSIONS[key];
        }
      }

      for (const key in BANNED_IP_TIMEOUT) {
        if (Date.now() - BANNED_IP_TIMEOUT[key].firstTryAt >= 60000 && BANNED_IP_TIMEOUT[key].try >= 3) {
          info("Ban Cleaner", "Cleaning " + key);
          delete BANNED_IP_TIMEOUT[key];
        }
      }
    }, 60000 * 5);

    await fastifyServer.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    fastifyServer.log.error(err);
    process.exit(1);
  }
})();

