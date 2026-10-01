import { replaceCurrentDatePlaceholderInString } from "./current-date"
import { replaceDataSourcePlaceholdersInString } from "./data-source"

export { replaceCurrentDatePlaceholderInString } from "./current-date"
export { replaceDataSourcePlaceholdersInString } from "./data-source"

export function replacePlaceholdersInString(
  str: string,
  data: unknown,
  now: Date = new Date(),
): string {
  if (data === null || data === undefined) {
    return replaceCurrentDatePlaceholderInString(str, now)
  }
  return replaceCurrentDatePlaceholderInString(
    replaceDataSourcePlaceholdersInString(str, data),
    now,
  )
}
