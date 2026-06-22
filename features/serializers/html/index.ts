import type { AppNode } from "@/features/app-state"

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

  switch (node.tag) {
    case "header1":
      return `<h1>${children}</h1>`
    case "header2":
      return `<h2>${children}</h2>`
    case "header3":
      return `<h3>${children}</h3>`
    case "paragraph":
      return `<p>${children}</p>`
    case "inline-text":
      return `<span>${children}</span>`
    case "image": {
      const src = escapeHtml(node.attributes.src ?? "")
      const alt = escapeHtml(node.attributes.alt ?? "")
      return `<img src="${src}" alt="${alt}" />`
    }
    case "button":
      return `<button>${children}</button>`
    case "row":
      return `<div class="row">${children}</div>`
    case "column":
      return `<div class="column">${children}</div>`
    case "page":
      return `<div class="column">${children}</div>`
    default:
      return children
  }
}

export function serializeAppStateAsHtml(componentTree: ReadonlyArray<AppNode>): string {
  const page = componentTree[0]
  const pageTitle = escapeHtml(page?.attributes.title ?? "Untitled Page")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #333; }
    .container { padding: 1rem; max-width: 1200px; margin: 0 auto; }
    .row { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem; }
    .column { display: flex; flex-direction: row; gap: 1rem; margin-bottom: 1rem; }
    .column > * { flex: 1; }
    img { max-width: 100%; height: auto; }
    button { background-color: #0070f3; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; font-weight: 500; }
    button:hover { background-color: #0060df; }
    h1, h2, h3, h4, h5, h6 { margin-bottom: 0.5rem; }
    p { margin-bottom: 1rem; }
    @media (max-width: 768px) { .column { flex-direction: column; } }
  </style>
</head>
<body>
  ${page ? renderNode(page) : ""}
</body>
</html>`
}
