import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a unique ID for components
export const generateId = () => `${Math.random().toString(36).substring(2, 9)}`

// Helper function to intersperse and append items
export function intersperseAndAppend<T, U>(originalArray: T[], itemToInsert: U): (T | U)[] {
  if (originalArray.length === 0) {
    return [];
  }
  const result: (T | U)[] = originalArray.flatMap((element) => [itemToInsert, element])
  result.push(itemToInsert)
  return result
}
