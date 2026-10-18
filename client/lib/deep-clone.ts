"use client"

/**
 * Deep-clones a value using the structured clone algorithm when available,
 * falling back to JSON serialization in environments that lack it.
 *
 * `structuredClone` is faster than `JSON.parse(JSON.stringify(...))` and
 * preserves types that JSON cannot represent (Date, Map, Set, undefined,
 * etc.). The JSON fallback keeps history/undo-redo working on older
 * browsers and older Node versions.
 */
export function deepClone<T>(value: T): T {
  if (typeof structuredClone !== "undefined") {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value))
}
