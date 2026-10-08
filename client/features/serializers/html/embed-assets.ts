import type { AppNode } from "@/client/features/types"

const EMBEDDABLE_KEYS = new Set(["src", "fallbackSrc", "favicon", "ogImage"])
const MAX_EMBED_BYTES = 1_500_000

export type EmbeddedAsset = Readonly<{
  dataUrl: string
}>

export type EmbeddableAssetResponse = Readonly<{
  ok: boolean
  headers: { get(name: string): string | null }
  arrayBuffer: () => Promise<ArrayBuffer>
}>

export type EmbedHtmlAssetsOptions = Readonly<{
  assetBaseUrl?: string
  fetchAsset?: (url: string) => Promise<EmbeddableAssetResponse>
}>

function isEmbeddableValue(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && !value.startsWith("data:") && !value.startsWith("blob:")
}

function resolveAssetUrl(value: string, assetBaseUrl: string | undefined): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value
  if (!assetBaseUrl) return value
  return new URL(value, assetBaseUrl).href
}

export function collectEmbeddableAssetUrls(
  componentTree: ReadonlyArray<AppNode>,
  assetBaseUrl?: string,
): Map<string, string> {
  const urls = new Map<string, string>()
  const visit = (node: AppNode) => {
    if (node.tag === "image" || node.tag === "page") {
      for (const key of EMBEDDABLE_KEYS) {
        const value = node.attributes[key]
        if (!isEmbeddableValue(value) || urls.has(value)) continue
        urls.set(value, resolveAssetUrl(value, assetBaseUrl))
      }
    }
    for (const child of node.children) {
      if (typeof child !== "string") visit(child)
    }
  }
  for (const node of componentTree) visit(node)
  return urls
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64")
  let binary = ""
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }
  return btoa(binary)
}

export async function embedHtmlExportAssets(
  componentTree: ReadonlyArray<AppNode>,
  options: EmbedHtmlAssetsOptions = {},
): Promise<Readonly<Record<string, string>>> {
  const fetchAsset = options.fetchAsset ?? ((url: string) => fetch(url))
  const urls = collectEmbeddableAssetUrls(componentTree, options.assetBaseUrl)
  const embedded: Record<string, string> = {}

  await Promise.all([...urls.entries()].map(async ([original, resolved]) => {
    try {
      const response = await fetchAsset(resolved)
      if (!response.ok) return
      const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() || "application/octet-stream"
      if (!contentType.startsWith("image/") && contentType !== "application/octet-stream") return
      const bytes = new Uint8Array(await response.arrayBuffer())
      if (bytes.byteLength === 0 || bytes.byteLength > MAX_EMBED_BYTES) return
      embedded[original] = `data:${contentType};base64,${bytesToBase64(bytes)}`
    } catch {
      // Leave the original URL in place when an asset cannot be fetched.
    }
  }))

  return embedded
}

export function applyEmbeddedAssets(node: AppNode, embeddedAssets: Readonly<Record<string, string>>): AppNode {
  const attributes = node.tag === "image" || node.tag === "page"
    ? Object.fromEntries(Object.entries(node.attributes).map(([key, value]) => [
        key,
        EMBEDDABLE_KEYS.has(key) && typeof value === "string" && embeddedAssets[value]
          ? embeddedAssets[value]
          : value,
      ]))
    : node.attributes

  return {
    ...node,
    attributes,
    children: node.children.map((child) => typeof child === "string" ? child : applyEmbeddedAssets(child, embeddedAssets)),
  }
}
