export function formatComponentLabel(tag: string): string {
  return tag
    .replace(/-/g, " ")
    .replace(/([a-z])([0-9])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
