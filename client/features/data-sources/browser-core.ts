import type { AppNode } from "@/client/features/types"
import { replacePlaceholdersInString } from "@/client/features/placeholders"
import { JSONPath } from "jsonpath-plus"

export type DataSourceSettings = Readonly<{
  id: string
  settings: Readonly<Record<string, unknown>>
}>

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

function evaluateJsonPath(data: unknown, expression: string): unknown {
  try {
    const results = JSONPath({ path: expression, json: data, wrap: false }) as unknown[]
    return results.length === 1 ? results[0] : results
  } catch (error) {
    throw new Error(`Invalid JSONPath expression: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function loadBrowserDataSource(
  settings: DataSourceSettings,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  if (settings.id === "generated-data") {
    const source = settings.settings.generate
    const code = Array.isArray(source) ? source.join("") : String(source || "")
    return new Function("return (async () => {" + code + "})()")()
  }
  if (settings.id === "rest-api") {
    const rawUrl = settings.settings.url
    const response = await fetcher(Array.isArray(rawUrl) ? rawUrl.join("") : String(rawUrl || ""))
    if (!response.ok) throw new Error(`Data source request failed (${response.status})`)
    const result = await response.json()
    const source = settings.settings["parse-result"]
    const expression = Array.isArray(source) ? source.join("") : String(source || "")
    return expression.trim() ? evaluateJsonPath(result, expression.trim()) : result
  }
  throw new Error(`Unknown data source: ${settings.id}`)
}
