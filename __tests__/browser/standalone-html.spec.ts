import { createServer, type Server } from "node:http"
import { createRequire } from "node:module"
import { basename } from "node:path"
import { expect, test } from "@playwright/test"
import { build } from "esbuild"
import { DATA_SOURCE_FIELD_NAME, encodeDataSourceSettings } from "@/client/features/data-sources"
import { serializeAppStateAsHtml } from "@/client/features/serializers"
import type { AppNode } from "@/client/features/types"

const require = createRequire(`${process.cwd()}/package.json`)
const reactUrl = "https://esm.sh/react@19.1.0"
const reactDomUrl = "https://esm.sh/react-dom@19.1.0/client"

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
  const result = await build({
    entryPoints: ["livepage-react-entry", "livepage-react-dom-entry"],
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
        build.onResolve({ filter: /^livepage-react-(?:dom-)?entry$/ }, ({ path }) => ({
          path,
          namespace: "local-react-entry",
        }))
        build.onLoad({ filter: /.*/, namespace: "local-react-entry" }, ({ path }) => ({
          contents: path === "livepage-react-entry"
            ? 'import React from "react"; export default React;'
            : 'import ReactDOM from "react-dom/client"; export const createRoot = ReactDOM.createRoot;',
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
  const consoleErrors: string[] = []
  const failedRequests: string[] = []

  page.on("pageerror", error => pageErrors.push(error.message))
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text())
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
        } else if (url.pathname.startsWith("/__local/")) {
          moduleName = url.pathname.slice("/__local/".length)
        }
        const body = moduleName ? localReactModules.get(moduleName) : undefined
        if (body) {
          await route.fulfill({ status: 200, contentType: "text/javascript", body })
          return
        }
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
    await expect(page.locator("#livepage-root > section.livepage-page")).toBeVisible()
    expect(fulfilledPinnedImports).toEqual(new Set([reactUrl, reactDomUrl]))
    expect(blockedExternalRequests).toEqual([])
    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
    expect(failedRequests).toEqual([])
  } finally {
    await close(server)
  }
})
