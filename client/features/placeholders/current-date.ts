const CURRENT_DATE_PLACEHOLDER = "[#CURRENT_DATE#]"

/**
 * Replaces the current date placeholder ([#CURRENT_DATE#]) in a string
 * with the ISO string representation of the provided date.
 *
 * @param str - String containing the current date placeholder
 * @param now - Date to use for replacement (defaults to current date)
 * @returns String with the placeholder replaced
 */
export function replaceCurrentDatePlaceholderInString(str: string, now: Date = new Date()): string {
  return str.replaceAll(CURRENT_DATE_PLACEHOLDER, now.toISOString())
}
