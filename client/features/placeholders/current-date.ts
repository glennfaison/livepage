const CURRENT_DATE_PLACEHOLDER = "[#CURRENT_DATE#]"

export function replaceCurrentDatePlaceholderInString(str: string, now: Date = new Date()): string {
  return str.replaceAll(CURRENT_DATE_PLACEHOLDER, now.toISOString())
}
