import { mkdir, writeFile } from "fs/promises";
import { FsContent, ReadDir } from "./read_dir";
import path from "path";

function getNextName(current: FsContent[], startWith: string): string {
  const existing = current.find(d => d.name.startsWith(startWith));
  if (existing) {
    const tmp = existing.name.slice(existing.name.lastIndexOf(" ") + 1);

    if (tmp !== "file" && tmp !== "folder")
      return startWith + " " + (+tmp + 1).toString();
    else
      return startWith + " " + "1";
  }
  return startWith;
}

async function getExisting(startWith: string, src: string): Promise<FsContent[]> {
  let current = await ReadDir(src, { ignoreMetadata: true });
  current = current.filter(d => d.name === startWith || d.name.startsWith(startWith + " "));
  current.sort((a, b) => {
    const aVal = a.name.slice(a.name.lastIndexOf(" ") + 1);
    const bVal = b.name.slice(b.name.lastIndexOf(" ") + 1);
    let compareResult = null;

    if (Number(aVal) && Number(bVal)) {
      compareResult = +bVal - +aVal;
    }

    return compareResult != null ? compareResult : b.name.localeCompare(a.name);
  });

  return current;
}

export async function CreateEmptyFile(src: string): Promise<string> {
  const current = await getExisting("New file", src);
  const newName = getNextName(current, "New file");

  await writeFile(
    path.join(src, getNextName(current, newName)), ""
  );

  return newName;
}

export async function CreateEmptyFolder(src: string): Promise<string> {
  const current = await getExisting("New folder", src);
  const newName = getNextName(current, "New folder");

  await mkdir(path.join(src, newName));

  return newName;
}