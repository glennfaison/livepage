/**
 * Replaces data source placeholders ([#data...#]) in a string with values
 * evaluated from the provided data object. The placeholder content is
 * evaluated as a JavaScript expression with `data` as the variable.
 *
 * @param str - String containing data source placeholders
 * @param data - Data object to evaluate expressions against
 * @returns String with data source placeholders replaced
 */
export function replaceDataSourcePlaceholdersInString(str: string, data: unknown): string {
  const placeholderRegExp = /\[#data.*?#\]/g

  return str.replaceAll(placeholderRegExp, (match) => {
    try {
      const evaluateProperty = new Function("data", `return (${match.substring(2, match.length - 2)})`)
      const output = evaluateProperty(data)
      if (output === undefined || output === null) return ""
      return typeof output === "string" ? output : String(output)
    } catch {
      return match
    }
  })
}
