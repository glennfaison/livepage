import { replaceDataSourceComponentProperties } from "./browser-core"
import { createDesignComponentInstance } from "@/client/features/design-components/registry"

describe("replaceDataSourceComponentProperties with default attributes (issue #333)", () => {
  it("does not crash on a button with a boolean disabled default", () => {
    const button = createDesignComponentInstance("button", "1")
    const result = replaceDataSourceComponentProperties(button, { name: "World" })
    expect(result.attributes.disabled).toBe("false")
  })

  it("does not crash on an image with a number opacity default", () => {
    const image = createDesignComponentInstance("image", "1")
    const result = replaceDataSourceComponentProperties(image, { name: "World" })
    expect(result.attributes.opacity).toBe("1")
  })
})
