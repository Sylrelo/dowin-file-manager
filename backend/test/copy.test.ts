import { constants, mkdir, rm, writeFile } from "fs/promises";
import path from "path";
import tap from "tap";
import { ReadDir } from "../src/Services/read_dir";
import { authenticate } from "./_authenticate";
import { makeRequest } from "./_utils";
import { sleep } from "../src/global";
import { fastifyServer } from "../src/fastify";

const PREFIX = "./test-folders";

async function prepareFolders() {
  try {
    await mkdir(PREFIX);
    await mkdir(path.join(PREFIX, "one"));
    await mkdir(path.join(PREFIX, "two"));
    await mkdir(path.join(PREFIX, "tree"));
    await mkdir(path.join(PREFIX, "four"));

    await writeFile(path.join(PREFIX, "test-file-1"), "---");
    await writeFile(path.join(PREFIX, "test-file-2"), "---");
  } catch (_) {
    //
  }
}

tap.after(async () => {
  try {
    await rm(PREFIX, {
      force: true,
      recursive: true
    });
  } catch (_) {
    //
  }
});

tap.before(async () => {
  await authenticate();
  await prepareFolders();
});

tap.test("Should Copy Files", async t => {
  t.plan(4);

  t.equal((await makeRequest("post", "/api/fs/cp", {
    src: path.join(PREFIX, "test-file-1"),
    dst: path.join(PREFIX, "one"),
  })).statusCode, 200);

  t.equal((await makeRequest("post", "/api/fs/cp", {
    src: path.join(PREFIX, "test-file-2"),
    dst: path.join(PREFIX, "one"),
  })).statusCode, 200);

  await sleep(100);
  let copyFileResult = await ReadDir(path.join(PREFIX, "one"));

  t.equal(
    copyFileResult.map(r => r.name).join(" "),
    ["test-file-1", "test-file-2"].join(" "),
  );

  copyFileResult = await ReadDir(path.join(PREFIX));
  copyFileResult = copyFileResult.filter(f => (f.fileType & constants.S_IFREG) === constants.S_IFREG);

  t.equal(
    copyFileResult.map(r => r.name).join(" "),
    ["test-file-1", "test-file-2"].join(" "),
  );

  t.teardown(() => fastifyServer.close());
});


