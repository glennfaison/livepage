import type { AppNode } from "@/client/features/types"
import browserRuntime from "./generated/browser-runtime.js"
import browserStyles from "./generated/browser-styles.js"
import { appNodeTreeSchema } from "@/client/features/serializers/schema"
import { validateHtmlExport, type ValidationResult, type ValidationIssue } from "./validation"
import { ValidationDialog } from "./validation-dialog"

type HtmlExportOptions = Readonly<{
  assetBaseUrl?: string
}>

export { validateHtmlExport, type ValidationResult, type ValidationIssue, ValidationDialog }

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
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
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
