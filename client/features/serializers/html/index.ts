import type { AppNode } from "@/client/features/types"
import browserRuntime from "./generated/browser-runtime.js"
import browserStyles from "./generated/browser-styles.js"
import { appNodeTreeSchema } from "@/client/features/serializers/schema"

type HtmlExportOptions = Readonly<{
  assetBaseUrl?: string
}>

export type ExportValidationIssue = Readonly<{
  type: "error" | "warning" | "info"
  code: string
  message: string
  componentId?: string
  componentTag?: string
}>

export type ExportValidationResult = Readonly<{
  issues: ReadonlyArray<ExportValidationIssue>
  hasErrors: boolean
  hasWarnings: boolean
}>

const DATA_SOURCE_TAGS = new Set([
  "rest-api",
  "graphql",
  "rss-feed",
  "json-feed",
  "csv",
  "linkedin-profile",
])

const EXTERNAL_RESOURCE_TAGS = new Set(["image", "video", "iframe", "link", "script"])

function walkTree(
  tree: ReadonlyArray<AppNode>,
  visitor: (node: AppNode, path: ReadonlyArray<string>) => void,
  path: ReadonlyArray<string> = [],
): void {
  for (const node of tree) {
    if (typeof node === "string") continue
    const currentPath = [...path, node.attributes.id]
    visitor(node, currentPath)
    walkTree(node.children, visitor, currentPath)
  }
}

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

function checkDataSourceIssues(node: AppNode, issues: ExportValidationIssue[]): void {
  if (DATA_SOURCE_TAGS.has(node.tag)) {
    const settings = node.attributes["data-source"]
    const sourceId = settings ?? node.tag
    issues.push({
      type: "warning",
      code: "DATA_SOURCE_STANDALONE",
      message: `Data source "${sourceId}" requires server-side fetching and will not work in standalone HTML export. Data will appear empty unless the export is hosted with a compatible backend.`,
      componentId: node.attributes.id,
      componentTag: node.tag,
    })
  }
}

function checkAssetIssues(node: AppNode, issues: ExportValidationIssue[], assetBaseUrl: URL | null): void {
  if (node.tag === "image") {
    const src = node.attributes.src
    const fallbackSrc = node.attributes.fallbackSrc

    if (src && src.startsWith("/") && !src.startsWith("//") && !assetBaseUrl) {
      issues.push({
        type: "error",
        code: "MISSING_ASSET_BASE_URL",
        message: `Image "${src}" uses a relative URL but no assetBaseUrl was provided. The image will not load in the exported HTML.`,
        componentId: node.attributes.id,
        componentTag: node.tag,
      })
    }

    if (fallbackSrc && fallbackSrc.startsWith("/") && !fallbackSrc.startsWith("//") && !assetBaseUrl) {
      issues.push({
        type: "error",
        code: "MISSING_ASSET_BASE_URL",
        message: `Fallback image "${fallbackSrc}" uses a relative URL but no assetBaseUrl was provided. The fallback image will not load in the exported HTML.`,
        componentId: node.attributes.id,
        componentTag: node.tag,
      })
    }
  }

  if (node.tag === "video") {
    const src = node.attributes.src
    if (src && src.startsWith("/") && !src.startsWith("//") && !assetBaseUrl) {
      issues.push({
        type: "error",
        code: "MISSING_ASSET_BASE_URL",
        message: `Video "${src}" uses a relative URL but no assetBaseUrl was provided. The video will not load in the exported HTML.`,
        componentId: node.attributes.id,
        componentTag: node.tag,
      })
    }
  }

  if (node.tag === "iframe") {
    const src = node.attributes.src
    if (src && src.startsWith("/") && !src.startsWith("//") && !assetBaseUrl) {
      issues.push({
        type: "error",
        code: "MISSING_ASSET_BASE_URL",
        message: `Iframe "${src}" uses a relative URL but no assetBaseUrl was provided. The iframe will not load in the exported HTML.`,
        componentId: node.attributes.id,
        componentTag: node.tag,
      })
    }
  }
}

function checkCorsIssues(node: AppNode, issues: ExportValidationIssue[]): void {
  if (node.tag === "rest-api" || node.tag === "graphql") {
    const url = node.attributes.url
    if (url) {
      try {
        const urlObj = new URL(Array.isArray(url) ? url.join("") : url)
        if (urlObj.protocol === "http:" || urlObj.protocol === "https:") {
          issues.push({
            type: "warning",
            code: "POTENTIAL_CORS_ISSUE",
            message: `Data source "${url}" may have CORS restrictions when loaded from a standalone HTML file. Consider hosting the export on the same origin or configuring CORS headers.`,
            componentId: node.attributes.id,
            componentTag: node.tag,
          })
        }
      } catch {
        // Invalid URL, ignore
      }
    }
  }

  if (node.tag === "iframe") {
    const src = node.attributes.src
    if (src) {
      try {
        const urlObj = new URL(Array.isArray(src) ? src.join("") : src)
        if (urlObj.protocol === "http:" || urlObj.protocol === "https:") {
          issues.push({
            type: "warning",
            code: "POTENTIAL_CORS_ISSUE",
            message: `Iframe source "${src}" may be blocked by X-Frame-Options or Content-Security-Policy headers when embedded in exported HTML.`,
            componentId: node.attributes.id,
            componentTag: node.tag,
          })
        }
      } catch {
        // Invalid URL, ignore
      }
    }
  }
}

function checkBrokenLinks(node: AppNode, issues: ExportValidationIssue[]): void {
  if (node.tag === "link" || node.tag === "button") {
    const href = node.attributes.href
    if (href && href.startsWith("#") && href.length === 1) {
      issues.push({
        type: "warning",
        code: "EMPTY_ANCHOR_LINK",
        message: `Link has an empty anchor (href="#"). This will scroll to the top of the page in the exported HTML.`,
        componentId: node.attributes.id,
        componentTag: node.tag,
      })
    }
  }
}

export function validateHtmlExport(
  componentTree: ReadonlyArray<AppNode>,
  options: HtmlExportOptions = {},
): ExportValidationResult {
  const assetBaseUrl = options.assetBaseUrl ? new URL(options.assetBaseUrl) : null
  const issues: ExportValidationIssue[] = []

  walkTree(componentTree, (node, path) => {
    checkDataSourceIssues(node, issues)
    checkAssetIssues(node, issues, assetBaseUrl)
    checkCorsIssues(node, issues)
    checkBrokenLinks(node, issues)
  })

  return {
    issues,
    hasErrors: issues.some((issue) => issue.type === "error"),
    hasWarnings: issues.some((issue) => issue.type === "warning"),
  }
}

export function serializeAppStateAsHtml(
  componentTree: ReadonlyArray<AppNode>,
  options: HtmlExportOptions = {},
): string {
  const validatedTree = appNodeTreeSchema.parse(componentTree)
  const assetBaseUrl = options.assetBaseUrl ? new URL(options.assetBaseUrl) : null
  const tree = assetBaseUrl
    ? validatedTree.map((node) => resolvePublicImageUrls(node, assetBaseUrl))
    : validatedTree
  const page = tree[0]
  const title = page?.attributes.title ?? "Untitled Page"
  const escapedTitle = title
    .replaceAll(".replaceAll("&", "&")", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', """)
    .replaceAll("'", "'")
  const data = JSON.stringify(tree).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("&", "\\u0026")

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
  <style>${browserStyles}
    html, body { min-height: 100%; }
    body { margin: 0; font-family: "Inter", sans-serif; }
    #livepage-root { display: flex; flex-direction: column; min-height: 100vh; }
  </style>
</head>
<body><div id="livepage-root"></div>
<script id="livepage-data" type="application/json">${data}</script>
<script type="module">${browserRuntime}</script>
</body></html>`
}