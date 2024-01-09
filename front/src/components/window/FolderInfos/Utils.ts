export function getTreeSubfolders(object: Record<string, any>): string[] {
  return Object.keys(object).filter(k => !k.startsWith("_"))
}

export function doesTreeContainSubfolder(object: Record<string, any>): boolean {
  return getTreeSubfolders(object).length !== 0 || (object._files != null && object._files?.length !== 0)
}