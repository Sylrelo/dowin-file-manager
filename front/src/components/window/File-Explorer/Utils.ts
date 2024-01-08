export function formatLongPath(path: string): string {
  const MAX_SIZE = 42;

  if (path.length > 1 && path.length >= MAX_SIZE) {
    const splittedPath = path.split("/");

    if (splittedPath.length === 1) {
      return path;
    }

    return "../" + formatLongPath(splittedPath.slice(1).join("/"));
  }

  return path;
}

export function getLastPath(path: string | null | undefined): string | null {
  if (null == path || path.length <= 1) {
    return null;
  }

  const lastSlash = path.lastIndexOf("/")

  return path.slice(lastSlash + 1);

}