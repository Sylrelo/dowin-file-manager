import { JsonDb } from "./database";
import crypto from "crypto";
import argon2 from "argon2";

export interface User {
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

  async getOne(uuid: string): Promise<User | null> {
    if (this.isJsonDatabase) {
      return this.data[uuid] ?? null;
    }
  }

  async updateOne(uuid: string, data: Partial<User>): Promise<User | null> {
    if (this.isJsonDatabase) {
      let user = this.data?.[uuid];

      if (user == null) {
        return null;
      }

      data = Object.fromEntries(
        Object.entries(data).filter((([_, value]) => value != undefined))
      );

      if (data.password != null) {
        data.password = await argon2.hash(data.password, {
          timeCost: 10,
          hashLength: 128,
        });
      }

      user = {
        ...user,
        ...data
      };

      this.data[uuid] = user;

      this.saveJsonDb();
      return user;
    }
  }

  async getAll(): Promise<User[]> {
    if (this.isJsonDatabase) {
      return Object.values(structuredClone(this.data)).map(u => {
        delete u.password;
        return u;
      });
    }
  }

  async delete(uuid: string) {
    if (this.isJsonDatabase) {
      delete this.data[uuid];
      this.saveJsonDb();
    }
  }

  async create(username: string, password: string, role: string) {
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
        role,
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