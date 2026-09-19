import type { AppNode } from "@/features/types"

export type DataSourceSettings = Readonly<{
  id: string
  settings: Readonly<Record<string, unknown>>
}>

export function decodeBrowserDataSourceSettings(encoded: string): DataSourceSettings | null {
  try {
    const binary = typeof atob === "function"
      ? atob(encoded)
      : Buffer.from(encoded, "base64").toString("binary")
    const json = new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)))
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

  const replace = (value: string) => value
    .replace(/\[#data.*?#\]/g, (token) => {
      try {
        const result = new Function("data", "return (" + token.slice(2, -2) + ")")(dataFromSource)
        return result === undefined || result === null ? token : String(result)
      } catch {
        return token
      }
    })
    .replaceAll("[#CURRENT_DATE#]", now.toISOString())
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
    const code = Array.isArray(source) ? source.join("") : String(source || "")
    return code.trim() ? new Function("data", code)(result) : result
  }
  throw new Error(`Unknown data source: ${settings.id}`)
}
