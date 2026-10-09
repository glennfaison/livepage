import { replaceCurrentDatePlaceholderInString } from "./current-date"
import { replaceDataSourcePlaceholdersInString } from "./data-source"

export { replaceCurrentDatePlaceholderInString } from "./current-date"
export { replaceDataSourcePlaceholdersInString } from "./data-source"

/**
 * Replaces all placeholders in a string with actual values. Handles both
 * current date placeholders ([#CURRENT_DATE#]) and data source placeholders
 * ([#data...#]).
 *
 * @param str - String containing placeholders to replace
 * @param data - Data object for data source placeholders
 * @param now - Date to use for current date placeholder (defaults to now)
 * @returns String with all placeholders replaced
 */
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
