import type { AppNode } from "@/features/app-state"
import { getComponentInfo } from "@/features/design-components"
import { appSettings } from "@/app/app-settings"
import { appNodeTreeSchema } from "../schema"

const reactVersion = "19.1.0"
const dataSourceFieldName = appSettings.dataSources.dataSourceFieldName

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
// This is deliberately dependency-free. It is copied into the exported document so the
// document remains useful after the builder (and its module graph) is no longer available.
const browserRuntime = String.raw`
import React from "https://esm.sh/react@${reactVersion}";
import { createRoot } from "https://esm.sh/react-dom@${reactVersion}/client";

const e = React.createElement;
const dataSourceKey = ${JSON.stringify(dataSourceFieldName)};
const paragraphFallback = "Morbi consequat justo enim, sed accumsan metus blandit eget. Etiam ornare neque sagittis metus hendrerit tincidunt.";

function decodeSettings(value) {
  try { return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(value), c => c.charCodeAt(0)))); }
  catch (_) { return null; }
}
function valueFor(expression, data) {
  try { return new Function("data", "return (" + expression + ")")(data); } catch (_) { return undefined; }
}
function replaceText(value, data) {
  return value
    .replace(/\[#data.*?#\]/g, token => {
      const result = valueFor(token.slice(2, -2), data);
      return result === undefined || result === null ? token : String(result);
    })
    .replaceAll("[#CURRENT_DATE#]", new Date().toISOString());
}
function resolveNode(node, data) {
  if (data === null || data === undefined) return node;
  return {
    ...node,
    attributes: Object.fromEntries(Object.entries(node.attributes)
      .filter(([key]) => key !== dataSourceKey)
      .map(([key, value]) => [key, replaceText(value, data)])),
    children: node.children.map(child => typeof child === "string" ? replaceText(child, data) : resolveNode(child, data))
  };
}
async function loadData(encoded) {
  const settings = decodeSettings(encoded);
  if (!settings || !settings.id) throw new Error("Invalid data-source settings");
  if (settings.id === "generated-data") {
    const source = Array.isArray(settings.settings.generate) ? settings.settings.generate.join("") : String(settings.settings.generate || "");
    return await new Function("return (async () => {" + source + "})()")();
  }
  if (settings.id === "rest-api") {
    const rawUrl = settings.settings.url;
    const response = await fetch(Array.isArray(rawUrl) ? rawUrl.join("") : String(rawUrl || ""));
    if (!response.ok) throw new Error("Data source request failed (" + response.status + ")");
    const result = await response.json();
    const source = Array.isArray(settings.settings["parse-result"]) ? settings.settings["parse-result"].join("") : String(settings.settings["parse-result"] || "");
    return source.trim() ? new Function("data", source)(result) : result;
  }
  throw new Error("Unknown data source: " + settings.id);
}
function useDataSource(node) {
  const encoded = node.attributes && node.attributes[dataSourceKey];
  const [state, setState] = React.useState(encoded ? { loading: true } : { data: null });
  React.useEffect(() => {
    if (!encoded) return;
    let active = true;
    loadData(encoded).then(data => active && setState({ data })).catch(error => active && setState({ error }));
    return () => { active = false; };
  }, [encoded]);
  return state;
}
function NodeRenderer({ node, data }) {
  const source = useDataSource(data ? { ...node, attributes: {} } : node);
  if (source.loading) return e("div", { className: "livepage-loading" }, "Loading...");
  if (source.error) return e("div", { className: "livepage-error" }, "Error: " + String(source.error.message || source.error));
  if (source.data !== null && source.data !== undefined) {
    if (Array.isArray(source.data)) return e("div", { className: "block" }, source.data.map((item, i) => e(NodeRenderer, { key: i, node: resolveNode(node, item), data: item })));
    return e(NodeRenderer, { node: resolveNode(node, source.data), data: source.data });
  }
  const current = data ? resolveNode(node, data) : node;
  const attrs = { ...current.attributes };
  const custom = attrs["custom-classes"];
  delete attrs[dataSourceKey]; delete attrs["custom-classes"]; delete attrs.title;
  if (custom) attrs.className = custom;
  const style = {};
  ["padding", "margin"].forEach(prefix => ["top", "right", "bottom", "left"].forEach(side => {
    const key = prefix + "-" + side;
    if (attrs[key]) { style[prefix + side[0].toUpperCase() + side.slice(1)] = attrs[key]; delete attrs[key]; }
  }));
  attrs.style = { ...style, ...(attrs.style || {}) };
  const children = current.children.map((child, i) => typeof child === "string" ? child : e(NodeRenderer, { key: child.attributes.id || i, node: child }));
  switch (current.tag) {
    case "page": return e("section", { ...attrs, className: "livepage-page " + (attrs.className || "") }, e("div", { className: "livepage-container" }, children));
    case "header1": return e("h1", { ...attrs, className: "livepage-header1 " + (attrs.className || "") }, children.length ? children : "Header 1");
    case "header2": return e("h2", { ...attrs, className: "livepage-header2 " + (attrs.className || "") }, children.length ? children : "Header 2");
    case "header3": return e("h3", { ...attrs, className: "livepage-header3 " + (attrs.className || "") }, children.length ? children : "Header 3");
    case "paragraph": return e("p", { ...attrs, className: "livepage-paragraph " + (attrs.className || "") }, children.length ? children : paragraphFallback);
    case "inline-text": return e("span", { ...attrs, className: "livepage-inline " + (attrs.className || "") }, children.length ? children : "Inline text.");
    case "button": return e("button", { ...attrs, type: "button", className: "livepage-button " + (attrs.className || ""), onClick: () => window.dispatchEvent(new CustomEvent("livepage:button-click", { detail: current })) }, children.length ? children : "Button");
    case "image": { const imageAttrs = { ...attrs, src: attrs.src || attrs.fallbackSrc || "", alt: attrs.alt || "" }; delete imageAttrs.fallbackSrc; return e("img", { ...imageAttrs, className: "livepage-image " + (imageAttrs.className || "") }); }
    case "row": return e("div", { ...attrs, className: "livepage-row " + (attrs.className || "") }, children);
    case "column": return e("div", { ...attrs, className: "livepage-column " + (attrs.className || "") }, children);
    default: return e(React.Fragment, null, children);
  }
}
const tree = JSON.parse(document.getElementById("livepage-data").textContent);
createRoot(document.getElementById("livepage-root")).render(e(React.Fragment, null, tree.map((node, i) => e(NodeRenderer, { key: node.attributes.id || i, node }))));
`

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
