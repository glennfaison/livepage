import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const idMap = { value: 0 }
// Generate a unique ID for components
export const generateId = () => `${++idMap.value}`

// Helper function to intersperse and append items
export function intersperseAndAppend<T, U>(originalArray: T[], itemToInsert: U): (T | U)[] {
  if (originalArray.length === 0) {
    return [];
  }
  const result: (T | U)[] = originalArray.flatMap((element) => [itemToInsert, element])
  result.push(itemToInsert)
  return result
}

export function insertDataSourceDataInString(str: string, data: unknown): string {
  const placeholderRegExp = /\[#data.*?#\]/g
  return str.replaceAll(placeholderRegExp, (match) => {
    const evaluateProperty = new Function("data", `return ${match.substring(2, match.length - 2)}`)
    const output = String(evaluateProperty(data))
    return output !== undefined && output !== null ? output : match
  })
}
