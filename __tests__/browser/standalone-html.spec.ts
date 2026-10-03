import { createServer, type Server } from "node:http"
import { createRequire } from "node:module"
import { readFile } from "node:fs/promises"
import { basename, extname, resolve } from "node:path"
import { expect, test } from "@playwright/test"
import { build } from "esbuild"
import { DATA_SOURCE_FIELD_NAME, encodeDataSourceSettings } from "@/client/features/data-sources"
import { serializeAppStateAsHtml } from "@/client/features/serializers"
import { pageTemplateRegistry } from "@/client/features/templates"
import type { AppNode } from "@/client/features/types"

const require = createRequire(`${process.cwd()}/package.json`)
const reactUrl = "https://esm.sh/react@19.1.0"
const reactDomUrl = "https://esm.sh/react-dom@19.1.0/client"
const reactJsxRuntimeUrl = "https://esm.sh/react@19.1.0/jsx-runtime"
const appOrigin = "http://127.0.0.1:3101"

const fixture: AppNode[] = [
  {
    tag: "page",
    attributes: { id: "page-1", title: "Standalone regression fixture" },
    children: [
      {
        tag: "header1",
        attributes: { id: "heading-1" },
        children: ["A page rendered from serialized app state"],
      },
      {
        tag: "paragraph",
        attributes: {
          id: "paragraph-1",
          [DATA_SOURCE_FIELD_NAME]: encodeDataSourceSettings({
            id: "generated-data",
            settings: { generate: ["return { name: 'Ada Lovelace' }"] },
          }),
        },
        children: ["Hello [#data.name#]"],
      },
      {
        tag: "button",
        attributes: { id: "button-1" },
        children: ["Continue"],
      },
    ],
  },
]

async function createLocalReactModules() {
  const reactNamedExports = Object.keys(require("react"))
    .filter((name) => name !== "default" && /^[A-Za-z_$][\w$]*$/.test(name))
    .map((name, index) => `const __react${index}=React[${JSON.stringify(name)}];export{__react${index} as ${name}};`)
    .join("")
  const result = await build({
    entryPoints: [
      "livepage-react-entry",
      "livepage-react-dom-entry",
      "livepage-react-jsx-runtime-entry",
    ],
    bundle: true,
    splitting: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    outdir: "playwright-artifact",
    write: false,
    minify: true,
    plugins: [{
      name: "local-react-package-entries",
      setup(build) {
        build.onResolve({ filter: /^livepage-react-(?:(?:dom|jsx-runtime)-)?entry$/ }, ({ path }) => ({
          path,
          namespace: "local-react-entry",
        }))
        build.onLoad({ filter: /.*/, namespace: "local-react-entry" }, ({ path }) => ({
          contents: path === "livepage-react-entry"
            ? `import React from "react"; export default React; ${reactNamedExports}`
            : path === "livepage-react-dom-entry"
              ? 'import ReactDOM from "react-dom/client"; export const createRoot = ReactDOM.createRoot;'
              : 'export { jsx, jsxs, Fragment } from "react/jsx-runtime";',
          loader: "js",
          resolveDir: process.cwd(),
        }))
      },
    }],
  })

  const modules = new Map<string, string>()
  for (const file of result.outputFiles) {
    const name = basename(file.path)
    const browserModule = file.text.replace(
      /(["'])\.\/(chunk-[^"']+)\1/g,
      '$1https://esm.sh/__local/$2$1',
    )
    modules.set(name, browserModule)
  }

  return modules
}

async function listen(server: Server): Promise<number> {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })
  const address = server.address()
  if (!address || typeof address === "string") throw new Error("Expected a loopback TCP server")
  return address.port
}

async function close(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve())
  })
}

test("renders the exact standalone HTML serializer artifact in Chromium", async ({ page }) => {
  expect(require("react/package.json").version).toBe("19.1.0")
  expect(require("react-dom/package.json").version).toBe("19.1.0")
  const html = serializeAppStateAsHtml(fixture)
  const localReactModules = await createLocalReactModules()
  const server = createServer((request, response) => {
    if (request.url === "/favicon.ico") {
      response.writeHead(204).end()
      return
    }
    if (request.url !== "/standalone.html") {
      response.writeHead(404).end()
      return
    }
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(html)
  })
  const port = await listen(server)
  const localOrigin = `http://127.0.0.1:${port}`
  const fulfilledPinnedImports = new Set<string>()
  const blockedExternalRequests: string[] = []
  const pageErrors: string[] = []
  const consoleErrors = new Set<string>()
  const failingResponses: string[] = []
  const failedRequests: string[] = []

  page.on("pageerror", error => pageErrors.push(error.message))
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.add(`${message.location().url}: ${message.text()}`)
  })
  page.on("response", response => {
    if (response.status() >= 400) failingResponses.push(`${response.status()} ${response.url()}`)
  })
  page.on("requestfailed", request => failedRequests.push(`${request.url()}: ${request.failure()?.errorText}`))

  try {
    await page.route("**/*", async route => {
      const url = new URL(route.request().url())
      if (url.origin === localOrigin) {
        await route.continue()
        return
      }
      if (url.origin === "https://esm.sh") {
        let moduleName: string | undefined
        if (url.href === reactUrl) {
          moduleName = "livepage-react-entry.js"
          fulfilledPinnedImports.add(reactUrl)
        } else if (url.href === reactDomUrl) {
          moduleName = "livepage-react-dom-entry.js"
          fulfilledPinnedImports.add(reactDomUrl)
        } else if (url.href === reactJsxRuntimeUrl) {
          moduleName = "livepage-react-jsx-runtime-entry.js"
          fulfilledPinnedImports.add(reactJsxRuntimeUrl)
        } else if (url.pathname.startsWith("/__local/")) {
          moduleName = url.pathname.slice("/__local/".length)
        }
        const body = moduleName ? localReactModules.get(moduleName) : undefined
        if (body) {
          await route.fulfill({ status: 200, contentType: "text/javascript", body })
          return
        }
      }
      if (url.href === "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap") {
        await route.fulfill({
          status: 200,
          contentType: "text/css",
          body: "@font-face{font-family:Inter;src:local(Arial);font-weight:100 900}",
        })
        return
      }
      blockedExternalRequests.push(url.href)
      await route.abort("blockedbyclient")
    })

    const response = await page.goto(`${localOrigin}/standalone.html`)
    expect(response?.status()).toBe(200)
    expect(await response?.text()).toBe(html)
    await expect(page).toHaveTitle("Standalone regression fixture")
    await expect(page.getByRole("heading", {
      level: 1,
      name: "A page rendered from serialized app state",
    })).toBeVisible()
    await expect(page.getByText("Hello Ada Lovelace", { exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible()
    await expect(page.locator("#livepage-root > section")).toBeVisible()
    expect(fulfilledPinnedImports).toEqual(new Set([reactUrl, reactDomUrl, reactJsxRuntimeUrl]))
    expect(blockedExternalRequests).toEqual([])
    expect(pageErrors).toEqual([])
    expect(failingResponses).toEqual([])
    expect([...consoleErrors]).toEqual([])
    expect(failedRequests).toEqual([])
  } finally {
    await close(server)
  }
})

async function getLocalInterStyles(
  page: import("@playwright/test").Page,
  origin: string,
): Promise<string> {
  return page.evaluate((origin) => {
    const bodyFont = getComputedStyle(document.body).fontFamily
      .split(",")[0]
      .replaceAll('"', "")
      .replaceAll("'", "")
      .trim()
    const rules: string[] = []

    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if (!(rule instanceof CSSFontFaceRule)) continue
          if (rule.style.fontFamily.replaceAll('"', "").replaceAll("'", "").trim() !== bodyFont) continue

          const cssText = rule.cssText
            .replaceAll(bodyFont, "Inter")
            .replace(/url\((['"]?)(\/[^)'"]+)\1\)/g, (_match, _quote, path: string) => `url("${origin}${path}")`)
          rules.push(cssText)
        }
      } catch {
        // Ignore cross-origin stylesheets; the app font is served by a local stylesheet.
      }
    }
    return rules.join("\n")
  }, origin)
}

async function readPreviewSnapshot(
  page: import("@playwright/test").Page,
  selector: string,
  exportOrigin: string,
) {
  return page.locator(selector).evaluate((root, exportOrigin) => {
    const styleProperties = [
      "display", "position", "box-sizing", "width", "min-width", "max-width",
      "height", "min-height", "max-height", "margin-top", "margin-right",
      "margin-bottom", "margin-left", "padding-top", "padding-right",
      "padding-bottom", "padding-left", "gap", "row-gap", "column-gap",
      "flex", "flex-direction", "flex-wrap", "align-items", "justify-content",
      "color", "background-color", "font-family", "font-size", "font-weight",
      "line-height", "letter-spacing", "text-align", "border-top-width",
      "border-right-width", "border-bottom-width", "border-left-width",
      "border-top-color", "border-radius", "overflow", "object-fit", "box-shadow",
    ]
    const rootRect = root.getBoundingClientRect()
    const elements = [root, ...Array.from(root.querySelectorAll("*"))]

    return {
      rootWidth: Math.round(rootRect.width * 100) / 100,
      elements: elements.map((element) => {
        const rect = element.getBoundingClientRect()
        const computed = getComputedStyle(element)
        const fontFamily = computed.fontFamily
        return {
          tag: element.tagName,
          text: Array.from(element.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent),
          attributes: Array.from(element.attributes)
            .map(({ name, value }) => [
              name,
              name === "src" && value.startsWith(`${exportOrigin}/`)
                ? value.slice(exportOrigin.length)
                : value,
            ] as const)
            .sort(([left], [right]) => left.localeCompare(right)),
          geometry: [
            Math.round((rect.x - rootRect.x) * 100) / 100,
            Math.round((rect.y - rootRect.y) * 100) / 100,
            Math.round(rect.width * 100) / 100,
            Math.round(rect.height * 100) / 100,
          ],
          styles: styleProperties.map((property) => [
            property,
            property === "font-family" && /inter/i.test(fontFamily) ? "Inter" : computed.getPropertyValue(property),
          ]),
        }
      }),
    }
  }, exportOrigin)
}

test("all bundled templates render like standalone HTML at desktop and mobile sizes", async ({ page }) => {
  test.setTimeout(180_000)
  const localReactModules = await createLocalReactModules()
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1")
    if (url.pathname === "/favicon.ico") {
      response.writeHead(204).end()
      return
    }
    if (url.pathname.startsWith("/_next/static/media/")) {
      void readFile(resolve(process.cwd(), ".next-playwright/static/media", basename(url.pathname)))
        .then((font) => response.writeHead(200, { "content-type": "font/woff2" }).end(font))
        .catch(() => response.writeHead(404).end())
      return
    }
    if (url.pathname.startsWith("/avatars/") || url.pathname.startsWith("/template-art/")) {
      const assetPath = resolve(process.cwd(), "public", `.${url.pathname}`)
      const contentType = extname(assetPath) === ".svg" ? "image/svg+xml" : "application/octet-stream"
      void readFile(assetPath)
        .then((asset) => response.writeHead(200, { "content-type": contentType }).end(asset))
        .catch(() => response.writeHead(404).end())
      return
    }
    const template = pageTemplateRegistry.find(({ id }) => id === url.searchParams.get("template"))
    if (url.pathname !== "/template.html" || !template) {
      response.writeHead(404).end()
      return
    }
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" })
      .end(serializeAppStateAsHtml(template.content.pages, { assetBaseUrl: exportOrigin }))
  })
  const port = await listen(server)
  const exportOrigin = `http://127.0.0.1:${port}`
  const loopbackOrigins = new Set([appOrigin, exportOrigin])
  const blockedExternalRequests: string[] = []
  const pageErrors: string[] = []
  const consoleErrors = new Set<string>()
  let localInterStyles = ""

  try {
    page.on("pageerror", error => pageErrors.push(error.message))
    page.on("console", message => {
      if (message.type() === "error") consoleErrors.add(`${message.location().url}: ${message.text()}`)
    })
    await page.route("**/*", async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      if (loopbackOrigins.has(url.origin)) {
        await route.continue()
        return
      }
      if (url.origin === "https://esm.sh") {
        let moduleName: string | undefined
        if (url.href === reactUrl) moduleName = "livepage-react-entry.js"
        if (url.href === reactDomUrl) moduleName = "livepage-react-dom-entry.js"
        if (url.href === reactJsxRuntimeUrl) moduleName = "livepage-react-jsx-runtime-entry.js"
        if (url.pathname.startsWith("/__local/")) moduleName = url.pathname.slice("/__local/".length)
        const body = moduleName ? localReactModules.get(moduleName) : undefined
        if (body) {
          await route.fulfill({ status: 200, contentType: "text/javascript", body })
          return
        }
      }
      if (url.origin === "https://fonts.googleapis.com") {
        await route.fulfill({
          status: 200,
          contentType: "text/css",
          body: localInterStyles || "@font-face{font-family:Inter;src:local(Arial);font-weight:100 900}",
        })
        return
      }
      if (request.resourceType() === "image") {
        await route.fulfill({
          status: 200,
          contentType: "image/png",
          body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/YmcAAAAASUVORK5CYII=", "base64"),
        })
        return
      }
      blockedExternalRequests.push(url.href)
      await route.abort("blockedbyclient")
    })

    for (const viewport of [
      { name: "desktop", width: 1440, height: 1000 },
      { name: "mobile", width: 390, height: 844 },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      for (const template of pageTemplateRegistry) {
        await page.goto(`${appOrigin}/try?template=${encodeURIComponent(template.id)}&mode=preview`)
        await expect(page.locator("#page-title")).toHaveValue(template.content.pages[0].attributes.title)
        await page.evaluate(() => document.fonts.ready)
        await expect(page.locator("main > section")).toBeVisible()

        if (!localInterStyles) {
          localInterStyles = await getLocalInterStyles(page, exportOrigin)
          expect(localInterStyles).toContain("@font-face")
        }

        const preview = await readPreviewSnapshot(page, "main > section", exportOrigin)
        const exportedHtml = serializeAppStateAsHtml(template.content.pages, {
          assetBaseUrl: exportOrigin,
        })
        const response = await page.goto(`${exportOrigin}/template.html?template=${encodeURIComponent(template.id)}`)
        expect(response?.status(), `${template.id} ${viewport.name} export`).toBe(200)
        expect(await response?.text()).toBe(exportedHtml)
        await page.evaluate(() => document.fonts.ready)
        await expect(page.locator("#livepage-root > section")).toBeVisible()

        const standalone = await readPreviewSnapshot(page, "#livepage-root > section", exportOrigin)
        expect(standalone.rootWidth, `${template.id} ${viewport.name} root width`)
          .toBeCloseTo(preview.rootWidth, 1)
        expect(standalone.elements.length, `${template.id} ${viewport.name} element count`)
          .toBe(preview.elements.length)
        standalone.elements.forEach((element, index) => {
          const { geometry, ...details } = element
          const { geometry: expectedGeometry, ...expectedDetails } = preview.elements[index]
          expect(details, `${template.id} ${viewport.name} DOM/style at node ${index}`)
            .toEqual(expectedDetails)
          geometry.forEach((coordinate, coordinateIndex) => {
            expect(coordinate, `${template.id} ${viewport.name} geometry at node ${index}, coordinate ${coordinateIndex}`)
              .toBeCloseTo(expectedGeometry[coordinateIndex], 1)
          })
        })
      }
    }
    expect(blockedExternalRequests).toEqual([])
    expect(pageErrors).toEqual([])
    expect([...consoleErrors]).toEqual([])
  } finally {
    await close(server)
  }
})
