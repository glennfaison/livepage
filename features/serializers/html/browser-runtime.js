import React from "https://esm.sh/react@19.1.0"
import { createRoot } from "https://esm.sh/react-dom@19.1.0/client"
import { decodeBrowserDataSourceSettings, loadBrowserDataSource, replaceDataSourceComponentProperties } from "../../design-component-runtime/shared/browser-core.ts"

const e = React.createElement
const dataSourceKey = "__datasource__"
const paragraphFallback = "Morbi consequat justo enim, sed accumsan metus blandit eget. Etiam ornare neque sagittis metus hendrerit tincidunt."

async function loadData(encoded) {
  const settings = decodeBrowserDataSourceSettings(encoded)
  if (!settings || !settings.id) throw new Error("Invalid data-source settings")
  return loadBrowserDataSource(settings)
}

function useDataSource(node) {
  const encoded = node.attributes && node.attributes[dataSourceKey]
  const [state, setState] = React.useState(encoded ? { loading: true } : { data: null })
  React.useEffect(() => {
    if (!encoded) return
    let active = true
    loadData(encoded).then((data) => active && setState({ data })).catch((error) => active && setState({ error }))
    return () => { active = false }
  }, [encoded])
  return state
}

function NodeRenderer({ node, data }) {
  const source = useDataSource(data ? { ...node, attributes: {} } : node)
  if (source.loading) return e("div", { className: "livepage-loading" }, "Loading...")
  if (source.error) return e("div", { className: "livepage-error" }, "Error: " + String(source.error.message || source.error))
  if (source.data !== null && source.data !== undefined) {
    if (Array.isArray(source.data)) return e("div", { className: "block" }, source.data.map((item, index) => e(NodeRenderer, { key: index, node: replaceDataSourceComponentProperties(node, item), data: item })))
    return e(NodeRenderer, { node: replaceDataSourceComponentProperties(node, source.data), data: source.data })
  }
  const current = data ? replaceDataSourceComponentProperties(node, data) : node
  const attrs = { ...current.attributes }
  const custom = attrs["custom-classes"]
  delete attrs[dataSourceKey]
  delete attrs["custom-classes"]
  delete attrs.title
  if (custom) attrs.className = custom
  const style = {}
  for (const prefix of ["padding", "margin"]) {
    for (const side of ["top", "right", "bottom", "left"]) {
      const key = prefix + "-" + side
      if (attrs[key]) {
        style[prefix + side[0].toUpperCase() + side.slice(1)] = attrs[key]
        delete attrs[key]
      }
    }
  }
  attrs.style = { ...style, ...(attrs.style || {}) }
  const children = current.children.map((child, index) => typeof child === "string" ? child : e(NodeRenderer, { key: child.attributes.id || index, node: child }))
  switch (current.tag) {
    case "page": return e("section", { ...attrs, className: "livepage-page " + (attrs.className || "") }, e("div", { className: "livepage-container" }, children))
    case "header1": return e("h1", { ...attrs, className: "livepage-header1 " + (attrs.className || "") }, children.length ? children : "Header 1")
    case "header2": return e("h2", { ...attrs, className: "livepage-header2 " + (attrs.className || "") }, children.length ? children : "Header 2")
    case "header3": return e("h3", { ...attrs, className: "livepage-header3 " + (attrs.className || "") }, children.length ? children : "Header 3")
    case "paragraph": return e("p", { ...attrs, className: "livepage-paragraph " + (attrs.className || "") }, children.length ? children : paragraphFallback)
    case "inline-text": return e("span", { ...attrs, className: "livepage-inline " + (attrs.className || "") }, children.length ? children : "Inline text.")
    case "button": return e("button", { ...attrs, type: "button", className: "livepage-button " + (attrs.className || ""), onClick: () => window.dispatchEvent(new CustomEvent("livepage:button-click", { detail: current })) }, children.length ? children : "Button")
    case "image": {
      const imageAttrs = { ...attrs, src: attrs.src || attrs.fallbackSrc || "", alt: attrs.alt || "" }
      delete imageAttrs.fallbackSrc
      return e("img", { ...imageAttrs, className: "livepage-image " + (imageAttrs.className || "") })
    }
    case "row": return e("div", { ...attrs, className: "livepage-row " + (attrs.className || "") }, children)
    case "column": return e("div", { ...attrs, className: "livepage-column " + (attrs.className || "") }, children)
    default: return e(React.Fragment, null, children)
  }
}

const tree = JSON.parse(document.getElementById("livepage-data").textContent)
createRoot(document.getElementById("livepage-root")).render(e(React.Fragment, null, tree.map((node, index) => e(NodeRenderer, { key: node.attributes.id || index, node }))))
