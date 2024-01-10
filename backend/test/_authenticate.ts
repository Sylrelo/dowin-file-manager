
import { fastifyServer } from "../src/fastify";
import { sleep } from "../src/global";
import { writeFile } from "fs/promises";

export let AUTH_TOKEN = "";

export async function authenticate() {
  await writeFile("database/db_users.json", JSON.stringify(
    {
      "253f4e0f-c59a-44ac-95bb-074b9180984b": {
        "uuid": "253f4e0f-c59a-44ac-95bb-074b9180984b",
        "role": "ADMIN",
        "username": "Admin",
        "password": "$argon2id$v=19$m=65536,t=10,p=4$XRSoQTqWeFdL3kxF5yTnYw$uzHKHOef00ypLi857k+N/xT6Ffb827qtxF1qQhhCeUkatvP4cjpwq9RnV3IclyOWQTGuWJTI20BLIJry7bdbdLS30VKCBeUpeYyC2yCRBmNzKMUgr7CoFs4ZW/ZkPy6dmdJw3BGnwPVE+mlbT/ocxJ21k6wMF2rwF362Smjrkts"
      }
    }
  ));

  await fastifyServer.inject({ method: "get", url: "/" });
  await sleep(500);
  console.log("Init done.");

  const response = await fastifyServer.inject({
    method: "post",
    url: "/api/users/login",
    body: {
      username: "Admin",
      password: "ir3kbq"
    }
  });

  AUTH_TOKEN = JSON.parse(response.body)["authToken"];
}