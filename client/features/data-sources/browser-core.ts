import type { AppNode } from "@/client/features/types"
import { replacePlaceholdersInString } from "@/client/features/placeholders"
import { dataSourceCache, dataSourceCacheKey } from "./cache"

export type DataSourceSettings = Readonly<{
  id: string
  settings: Readonly<Record<string, unknown>>
}>

/**
 * Decodes a base64-encoded data source settings string (from the browser
 * registry format) into its component ID and settings object.
 * Handles both browser (atob) and Node.js (Buffer) environments.
 *
 * @param encoded - Base64-encoded settings string
 * @returns DataSourceSettings object or null if decoding fails
 */
export function decodeBrowserDataSourceSettings(encoded: string): DataSourceSettings | null {
  try {
    const binary = typeof atob === "function"
      ? atob(encoded)
      : Buffer.from(encoded, "base64").toString("binary")
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    const json = typeof TextDecoder === "function"
      ? new TextDecoder().decode(bytes)
      : decodeURIComponent(Array.from(bytes, (byte) => `%${byte.toString(16).padStart(2, "0")}`).join(""))
    const value = JSON.parse(json)
    return value && typeof value.id === "string" ? value : null
  } catch {
    return null
  }
}

/**
 * Replaces placeholders in a component's attributes and children with
 * actual data from a data source. Returns a new component with replaced
 * values, leaving the original unchanged.
 *
 * @param originalComponent - The component to process
 * @param dataFromSource - Data returned from the data source
 * @param now - Current date for date placeholders (defaults to now)
 * @returns New component with placeholders replaced
 */
export function replaceDataSourceComponentProperties<T extends AppNode>(
  originalComponent: T,
  dataFromSource: unknown,
  now: Date = new Date(),
): T {
  if (dataFromSource === null || dataFromSource === undefined) return originalComponent

  const replace = (value: string) => replacePlaceholdersInString(value, dataFromSource, now)
  return {
    ...originalComponent,
    attributes: Object.fromEntries(
      Object.entries(originalComponent.attributes).map(([key, value]) => [key, replace(value)]),
    ),
    children: originalComponent.children.map((child) =>
      typeof child === "string"
        ? replace(child)
        : replaceDataSourceComponentProperties(child, dataFromSource, now),
    ),
  } as T
}

/**
 * Loads data from a browser-side data source. Supports generated-data
 * (executes user-provided code) and rest-api (fetches from URL with
 * optional result parsing).
 *
 * Successful results are cached in memory with a TTL; the cache is
 * consulted before fetching and bypassed when `options.bypassCache` is
 * true. Errors are never cached.
 *
 * @param settings - Data source settings including ID and configuration
 * @param fetcher - Fetch implementation to use (defaults to global fetch)
 * @param options - `bypassCache` skips the cache and forces a fresh fetch
 * @returns Promise resolving to the data from the source
 * @throws Error if data source ID is unknown or the fetch fails
 */
export async function loadBrowserDataSource(
  settings: DataSourceSettings,
  fetcher: typeof fetch = fetch,
  options: { bypassCache?: boolean } = {},
): Promise<unknown> {
  const { bypassCache = false } = options
  const key = dataSourceCacheKey(settings.id, settings.settings)

  if (!bypassCache) {
    const cached = dataSourceCache.get(key)
    if (cached !== null) return cached
  }

  let result: unknown

  if (settings.id === "generated-data") {
    const source = settings.settings.generate
    const code = Array.isArray(source) ? source.join("") : String(source || "")
    result = await new Function("return (async () => {" + code + "})()")()
  } else if (settings.id === "rest-api") {
    const rawUrl = settings.settings.url
    const response = await fetcher(Array.isArray(rawUrl) ? rawUrl.join("") : String(rawUrl || ""))
    if (!response.ok) throw new Error(`Data source request failed (${response.status})`)
    const unparsed = await response.json()
    const source = settings.settings["parse-result"]
    const code = Array.isArray(source) ? source.join("") : String(source || "")
    result = code.trim() ? new Function("data", code)(unparsed) : unparsed
  } else {
    throw new Error(`Unknown data source: ${settings.id}`)
  }

  if (!bypassCache) {
    dataSourceCache.set(key, result)
  }

  return result
}
