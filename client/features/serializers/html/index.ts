import type { AppNode } from "@/client/features/types"
import browserRuntime from "./generated/browser-runtime.js"
import selfContainedRuntime from "./generated/browser-runtime-self-contained.js"
import browserStyles from "./generated/browser-styles.js"
import { appNodeTreeSchema } from "@/client/features/serializers/schema"
import { applyEmbeddedAssets, embedHtmlExportAssets, type EmbedHtmlAssetsOptions } from "./embed-assets"
import { validateHtmlExport, type ValidationResult, type ValidationIssue } from "./validation"
import { ValidationDialog } from "./validation-dialog"

type HtmlExportMode = "linked" | "self-contained"

type HtmlExportOptions = Readonly<{
  assetBaseUrl?: string
  /** `linked` keeps pinned esm.sh React imports. `self-contained` inlines the runtime. */
  mode?: HtmlExportMode
  /** Original attribute values mapped to data URLs. Used by self-contained exports. */
  embeddedAssets?: Readonly<Record<string, string>>
}>

export { validateHtmlExport, type ValidationResult, type ValidationIssue, ValidationDialog }
export { embedHtmlExportAssets, type EmbedHtmlAssetsOptions }

function resolvePublicImageUrls(node: AppNode, assetBaseUrl: URL): AppNode {
  const attributes = node.tag === "image"
    ? Object.fromEntries(Object.entries(node.attributes).map(([key, value]) => [
        key,
        (key === "src" || key === "fallbackSrc") && value.startsWith("/") && !value.startsWith("//")
          ? new URL(value, assetBaseUrl).href
          : value,
      ]))
    : node.attributes

  return {
    ...node,
    attributes,
    children: node.children.map((child) =>
      typeof child === "string" ? child : resolvePublicImageUrls(child, assetBaseUrl),
    ),
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;")
}

/**
 * Serializes the app state (component tree) as a standalone HTML document.
 * The HTML includes the serialized component tree as JSON data, the browser
 * runtime, and styles for rendering. Relative image URLs can be resolved
 * against an optional asset base URL.
 *
 * `mode: "self-contained"` inlines the React runtime and compiled CSS, omits
 * Google Fonts, and rewrites assets present in `embeddedAssets` to data URLs.
 *
 * @param componentTree - The array of page components to serialize
 * @param options.assetBaseUrl - Optional base URL to resolve relative image URLs
 * @param options.mode - `linked` (default) or `self-contained`
 * @param options.embeddedAssets - Original asset values mapped to data URLs
 * @returns A complete HTML document as a string
 */
export function serializeAppStateAsHtml(
  componentTree: ReadonlyArray<AppNode>,
  options: HtmlExportOptions = {},
): string {
  const validatedTree = appNodeTreeSchema.parse(componentTree)
  const mode = options.mode ?? "linked"
  const withAssets = options.embeddedAssets
    ? validatedTree.map((node) => applyEmbeddedAssets(node, options.embeddedAssets ?? {}))
    : validatedTree
  const assetBaseUrl = mode === "linked" && options.assetBaseUrl ? new URL(options.assetBaseUrl) : null
  const tree = assetBaseUrl
    ? withAssets.map((node) => resolvePublicImageUrls(node, assetBaseUrl))
    : withAssets
  const page = tree[0]
  const title = page?.attributes.title ?? "Untitled Page"
  const description = page?.attributes.description ?? ""
  const favicon = page?.attributes.favicon ?? ""
  const ogImage = page?.attributes.ogImage ?? ""
  const canonicalUrl = page?.attributes.canonicalUrl ?? ""
  const customHead = Array.isArray(page?.attributes.customHead) ? page.attributes.customHead.join("\n") : (page?.attributes.customHead ?? "")
  const customCss = Array.isArray(page?.attributes.customCss) ? page.attributes.customCss.join("\n") : (page?.attributes.customCss ?? "")
  const customJs = Array.isArray(page?.attributes.customJs) ? page.attributes.customJs.join("\n") : (page?.attributes.customJs ?? "")
  const escapedTitle = escapeHtml(title)
  const escapedDescription = escapeHtml(description)
  const data = JSON.stringify(tree).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("&", "\\u0026")

  const metaTags = []
  if (description) metaTags.push(`  <meta name="description" content="${escapedDescription}">`)
  if (ogImage) metaTags.push(`  <meta property="og:image" content="${escapeHtml(ogImage)}">`)
  if (canonicalUrl) metaTags.push(`  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">`)

  const headExtras = []
  if (favicon) headExtras.push(`  <link rel="icon" href="${escapeHtml(favicon)}">`)
  if (customHead) headExtras.push(customHead)
  if (customCss) headExtras.push(`  <style>${customCss}</style>`)
  if (customJs) headExtras.push(`  <script>${customJs}</script>`)

  const fontLinks = mode === "self-contained"
    ? ""
    : `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">`
  const fontFamily = mode === "self-contained"
    ? "ui-sans-serif, system-ui, sans-serif"
    : '"Inter", sans-serif'
  const runtime = mode === "self-contained" ? selfContainedRuntime : browserRuntime

  return `
<!DOCTYPE html>
<html lang="en" data-livepage-export="${mode}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle}</title>
${metaTags.join("\n")}
${headExtras.join("\n")}
${fontLinks}
  <style>${browserStyles}
    html, body { min-height: 100%; }
    body { margin: 0; font-family: ${fontFamily}; }
    #livepage-root { display: flex; flex-direction: column; min-height: 100vh; }
  </style>
</head>
<body><div id="livepage-root"></div>
<script id="livepage-data" type="application/json">${data}</script>
<script type="module">${runtime}</script>
</body></html>`
}

/**
 * Builds a single-file HTML export with inlined CSS, a locally bundled React
 * runtime, and image/favicon/Open Graph assets embedded as base64 data URLs.
 */
export async function serializeAppStateAsSelfContainedHtml(
  componentTree: ReadonlyArray<AppNode>,
  options: EmbedHtmlAssetsOptions = {},
): Promise<string> {
  const embeddedAssets = await embedHtmlExportAssets(componentTree, options)
  return serializeAppStateAsHtml(componentTree, {
    mode: "self-contained",
    embeddedAssets,
  })
}
