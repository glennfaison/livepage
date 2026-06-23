export function replaceDataSourcePlaceholdersInString(str: string, data: unknown): string {
  const placeholderRegExp = /\[#data.*?#\]/g

  return str.replaceAll(placeholderRegExp, (match) => {
    const evaluateProperty = new Function("data", `return ${match.substring(2, match.length - 2)}`)
    const output = String(evaluateProperty(data))
    return output !== undefined && output !== null ? output : match
  })
}
