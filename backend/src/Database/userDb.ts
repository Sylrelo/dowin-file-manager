import { JsonDb } from "./database";
import crypto from "crypto";
import argon2 from "argon2";


interface User {
  uuid: string
  role: string
  username: string
  password: string
}


export class UserDb extends JsonDb<{ [key: string]: User }> {
  constructor() {
    super("db_users.json", {});

    if (this.isJsonDatabase && this.data === undefined) {
      this.data = {};
    }
  }

  async verifyJsonDb(): Promise<void> {
    for (const uuid in this.data) {
      const curr = this.data[uuid];

      if (curr.role == null || curr.role === "")
        curr.role = "USER";
    }

    this.saveJsonDb();
  }

  get count() {
    return Object.keys(this.data).length;
  }

  async create(username: string, password: string) {
    if (this.isJsonDatabase) {
      for (const key in this.data) {
        if (this.data[key].username === username) {
          console.log("Username already taken.");
          return;
        }
      }

      const uuid = crypto.randomUUID();

      this.data[uuid] = {
        uuid,
        role: "",
        username,
        password: await argon2.hash(password, {
          timeCost: 10,
          hashLength: 128,
        })
      };

      this.saveJsonDb();
    }
  }

  async tryLogin(username: string, password: string): Promise<string | null> {
    if (this.isJsonDatabase) {
      const user = Object.values(this.data).find(u => u.username === username);

      if (user == null) {
        console.log("Invalid user.");
        return null;
      }

      if ((await argon2.verify(user.password, password)) === false) {
        console.log("Invalid password.");
        return null;
      }

      return user.uuid;
    }
  }
}