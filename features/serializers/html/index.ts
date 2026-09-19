import type { AppNode } from "@/features/app-state"
import { getComponentInfo } from "@/features/design-components"
import browserRuntime from "./generated/browser-runtime.js"
import { appNodeTreeSchema } from "../schema"

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function renderNode(node: AppNode | string): string {
  if (typeof node === "string") {
    return escapeHtml(node)
  }

  const children = node.children.map(renderNode).join("")
  const metadata = getComponentInfo(node.tag)
  const tag = metadata.htmlTag ?? "div"
  const className = metadata.htmlClassName ? ` class="${escapeHtml(metadata.htmlClassName)}"` : ""

  if (tag === "img") {
    const src = escapeHtml(node.attributes.src ?? node.attributes.fallbackSrc ?? "")
    const alt = escapeHtml(node.attributes.alt ?? "")
    return `<img src="${src}" alt="${alt}"${className} />`
  }

  return `<${tag}${className}>${children}</${tag}>`
}


export function serializeAppStateAsHtml(componentTree: ReadonlyArray<AppNode>): string {
  const tree = appNodeTreeSchema.parse(componentTree)
  const page = tree[0]
  const title = escapeHtml(page?.attributes.title ?? "Untitled Page")
  const data = JSON.stringify(tree).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("&", "\\u0026")
  const fallback = tree.map(renderNode).join("")

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; } body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #333; line-height: 1.5; }
    .livepage-page { min-height: 100vh; background: #f9fafb; padding: 2rem 1rem; } .livepage-container { background: white; max-width: 64rem; min-height: 50rem; margin: 0 auto; padding: 1rem; border: 1px solid #e5e7eb; border-radius: .375rem; }
    .livepage-row { min-height: 50px; display: flex; flex-direction: row; align-items: stretch; } .livepage-column { min-height: 50px; display: flex; flex-direction: column; justify-content: center; }
    .livepage-row > *, .livepage-column > * { flex: 1 1 0%; min-width: 0; } .livepage-header1 { font-size: 2.25rem; font-weight: 700; padding: .5rem 0; } .livepage-header2 { font-size: 1.875rem; font-weight: 700; padding: .5rem 0; } .livepage-header3 { font-size: 1.5rem; font-weight: 700; padding: .5rem 0; }
    .livepage-paragraph { padding: .5rem 0; } .livepage-button { background: #2563eb; color: white; border: 0; border-radius: .25rem; padding: .5rem 1rem; cursor: pointer; } .livepage-image { max-width: 100%; height: auto; } .livepage-loading { opacity: .65; } .livepage-error { color: #b91c1c; }
    @media (max-width: 768px) { .livepage-row { flex-direction: column; } }
  </style>
</head>
<body><div id="livepage-root">${fallback ? `<noscript>${fallback}</noscript>` : ""}</div>
<script id="livepage-data" type="application/json">${data}</script>
<script type="module">${browserRuntime}</script>
</body></html>`
}
