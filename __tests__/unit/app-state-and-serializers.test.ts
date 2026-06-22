import { selectCurrentPage } from "@/features/app-state"
import { serializeAppStateAsHtml, serializeAppStateAsJson, serializeAppStateAsShortcode, deserializeAppStateFromJson, deserializeAppStateFromShortcode } from "@/features/serializers"

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

  it("escapes html output", () => {
    const html = serializeAppStateAsHtml(appState.componentTree as any)
    expect(html).toContain("&lt;Page&gt;")
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;")
    expect(html).not.toContain("<script>alert(1)</script>")
  })
})
