import { serializeAppStateAsJson, deserializeAppStateFromJson, serializeAppStateAsHtml } from "@/client/features/serializers"
import { createDesignComponentInstance } from "@/client/features/design-components/registry"

function pageWithButtonAndImage() {
  const button = createDesignComponentInstance("button", "1")
  const image = createDesignComponentInstance("image", "1")
  const page = createDesignComponentInstance("page", "1")
  return [{ ...page, children: [button, image] }]
}

describe("serializers with non-string default attributes (issue #333)", () => {
  it("JSON export of a page containing button and image re-imports cleanly", () => {
    const tree = pageWithButtonAndImage()
    const json = serializeAppStateAsJson(tree)
    expect(() => deserializeAppStateFromJson(json)).not.toThrow()
    expect(deserializeAppStateFromJson(json)).toEqual(tree)
  })

  it("HTML export works for a page containing button and image", () => {
    const tree = pageWithButtonAndImage()
    expect(() => serializeAppStateAsHtml(tree)).not.toThrow()
    const html = serializeAppStateAsHtml(tree)
    expect(html).toContain('id="livepage-data"')
  })
})
