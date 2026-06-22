import { replaceCurrentDatePlaceholderInString } from "./current-date"
import { replaceDataSourcePlaceholdersInString } from "./data-source"

export function replacePlaceholdersInString(str: string, data: unknown, now: Date = new Date()): string {
  const withDataSourceValues = replaceDataSourcePlaceholdersInString(str, data)
  return replaceCurrentDatePlaceholderInString(withDataSourceValues, now)
}
