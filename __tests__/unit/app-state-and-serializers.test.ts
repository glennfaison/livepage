import { selectCurrentPage } from "@/client/features/app-state"
import { decodeDataSourceSettings, encodeDataSourceSettings } from "@/client/features/data-sources"
import { serializeAppStateAsHtml, serializeAppStateAsJson, serializeAppStateAsShortcode, deserializeAppStateFromJson, deserializeAppStateFromShortcode } from "@/client/features/serializers"
import { validateImportedFile } from "@/client/features/page-builder"
import type { AppNode } from "@/client/features/types"

describe("app-state selectors and serializers", () => {
  const appState = {
    componentTree: [
      {
        tag: "page",
        attributes: { id: "page-1", title: "Home <Page>" },
        children: [
          {
            tag: "paragraph",
            attributes: { id: "paragraph-1" },
            children: ["Hello <script>alert(1)</script>"],
          },
        ],
      },
    ],
    activePage: "page-1",
  }

  it("selects the active page and falls back to the first page", () => {
    expect(selectCurrentPage(appState as any)?.attributes.id).toBe("page-1")
    expect(selectCurrentPage({ ...appState, activePage: "missing" } as any)?.attributes.id).toBe("page-1")
  })

  it("serializes and deserializes json without changing the tree", () => {
    const json = serializeAppStateAsJson(appState.componentTree as any)
    expect(deserializeAppStateFromJson(json)).toEqual(appState.componentTree)
  })

  it("rejects invalid json payloads", () => {
    expect(() => deserializeAppStateFromJson(JSON.stringify([{ tag: "unknown", attributes: {}, children: [] }]))).toThrow("Invalid component tag")
  })

  it("serializes and deserializes shortcode without changing the tree", () => {
    const shortcode = serializeAppStateAsShortcode(appState.componentTree as any)
    expect(deserializeAppStateFromShortcode(shortcode)).toEqual(appState.componentTree)
  })

  it("rejects invalid shortcode payloads", () => {
    expect(() => deserializeAppStateFromShortcode("[unknown]content[/unknown]")).toThrow("Invalid component tag")
  })

  it("validates import files before parsing", () => {
    const jsonFile = new File(["{}"], "page.json", { type: "application/json" })
    expect(() => validateImportedFile(jsonFile, "json")).not.toThrow()

    const wrongExtension = new File(["{}"], "page.txt", { type: "text/plain" })
    expect(() => validateImportedFile(wrongExtension, "json")).toThrow("valid JSON file")

    const emptyFile = new File([], "empty.json", { type: "application/json" })
    expect(() => validateImportedFile(emptyFile, "json")).toThrow("empty")
  })

  it("round-trips Unicode data-source settings in browser runtimes", () => {
    const settings = {
      id: "generated-data",
      settings: { generate: ["return { name: 'Zoë 🌱' }"] },
    } as const
    expect(decodeDataSourceSettings(encodeDataSourceSettings(settings))).toEqual(settings)
  })

  it("escapes html output", () => {
    const html = serializeAppStateAsHtml(appState.componentTree as any)
    expect(html).toContain("&lt;Page&gt;")
    expect(html).toContain("\\u003cscript\\u003ealert(1)\\u003c/script\\u003e")
    expect(html).not.toContain("<script>alert(1)</script>")
  })

  it("renders nested component trees through the shared preview runtime", () => {
    const html = serializeAppStateAsHtml([
      {
        tag: "page",
        attributes: { title: "Nested" },
        children: [{
          tag: "row",
          attributes: {},
          children: [{
            tag: "column",
            attributes: {},
            children: [{ tag: "header1", attributes: {}, children: ["Title"] }],
          }],
        }],
      },
    ] as any)

    expect(html).toContain('id="livepage-root"></div>')
    expect(html).toContain("text-4xl font-bold py-2")
    expect(html).not.toContain('<div class="column"><div class="row">')
  })

  it("resolves public image paths against the export origin", () => {
    const html = serializeAppStateAsHtml([
      {
        tag: "page",
        attributes: { title: "Image export" },
        children: [{
          tag: "image",
          attributes: {
            src: "/avatars/ada.svg",
            fallbackSrc: "/template-art/portrait.svg",
          },
          children: [],
        }],
      },
    ] satisfies ReadonlyArray<AppNode>, { assetBaseUrl: "https://livepage.example" })

    expect(html).toContain('"src":"https://livepage.example/avatars/ada.svg"')
    expect(html).toContain('"fallbackSrc":"https://livepage.example/template-art/portrait.svg"')
  })

  it("exports a browser runtime with the complete serialized tree", () => {
    const html = serializeAppStateAsHtml(appState.componentTree as any)
    expect(html).toContain('type="application/json"')
    expect(html).toContain('id="livepage-root"')
    expect(html).toContain("https://esm.sh/react@19.1.0")
    expect(html).toContain("https://esm.sh/react-dom@19.1.0/client")
    expect(html).toContain('new Function("data"')
    expect(html).toContain("__datasource__")
    expect(html).not.toContain("const browserRuntime")
  })
})
