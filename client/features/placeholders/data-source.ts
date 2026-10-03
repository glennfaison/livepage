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
