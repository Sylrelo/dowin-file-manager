import { constants, mkdir, rm, rmdir, writeFile } from "fs/promises";
import path from "path";
import tap from "tap";
import { ReadDir } from "../src/Services/read_dir";
import { authenticate } from "./_authenticate";
import { makeRequest } from "./_utils";
import { sleep } from "../src/global";
import { fastifyServer } from "../src/fastify";

const PREFIX = "./test-folders";

function j(src: string = "") {
  return path.join(PREFIX, src);
}

async function prepareFolders() {
  try {
    await rm(PREFIX, {
      force: true,
      recursive: true,
    })
  } catch (_) { }

  try {
    await mkdir(PREFIX);
    await mkdir(j("one"));
    await mkdir(j("two"));
    await mkdir(j("tree"));
    await mkdir(j("four"));

    await writeFile(j("test-file-1"), "---");
    await writeFile(j("test-file-2"), "---");


    await writeFile(j("four/test-file-1"), "---");
    await writeFile(j("four/test-file-2"), "---");
  } catch (_) { }
}

let alreadyInit = false;

tap.before(async () => {
  await prepareFolders();

  // if (alreadyInit === true) return;
  // alreadyInit = false;

  await authenticate();
});

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

tap.test("Should Copy Files [Basic]", async t => {
  t.plan(4);

  t.equal((
    await makeRequest("post", "/api/fs/cp", {
      src: j("test-file-1"),
      dst: j("one"),
    })
  ).statusCode, 200);

  t.equal((
    await makeRequest("post", "/api/fs/cp", {
      src: j("test-file-2"),
      dst: j("one"),
    })
  ).statusCode, 200);

  await sleep(100);
  let copyFileResult = await ReadDir(j("one"));

  t.equal(
    copyFileResult.map(r => r.name).join(" "),
    ["test-file-1", "test-file-2"].join(" "),
  );

  copyFileResult = await ReadDir(j());
  copyFileResult = copyFileResult.filter(f => (f.fileType & constants.S_IFREG) === constants.S_IFREG);

  t.equal(
    copyFileResult.map(r => r.name).join(" "),
    ["test-file-1", "test-file-2"].join(" "),
  );

  t.teardown(() => fastifyServer.close());
});

tap.test("Should Copy Directory [Basic]", async t => {
  await prepareFolders();
  t.plan(4);

  t.equal((
    await makeRequest("post", "/api/fs/cp", {
      src: j("four"),
      dst: j("one"),
    })
  ).statusCode, 200);
  await sleep(200);

  let result = await ReadDir(j("one"));
  t.equal(result[0].name, "four");

  result = await ReadDir(j("one/four"));
  t.equal(result.length, 2);
  t.equal(
    result.map(r => r.name).join(" "),
    ["test-file-1", "test-file-2"].join(" "),
  );
});

