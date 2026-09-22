import { createDesignComponentInstance } from "@/features/design-component-runtime/registry"
import { componentTagList } from "@/features/design-component-runtime/component-tags"

describe("createDesignComponentInstance default attributes", () => {
  it("stringifies boolean settings-field defaults (e.g. button's 'disabled')", () => {
    const button = createDesignComponentInstance("button", "test-id")

    expect(button.attributes.disabled).toBe("false")
    expect(typeof button.attributes.disabled).toBe("string")
  })

  it("stringifies number settings-field defaults (e.g. image's numeric fields)", () => {
    const image = createDesignComponentInstance("image", "test-id")

    for (const value of Object.values(image.attributes)) {
      expect(typeof value).toBe("string")
    }
  })

  it("never produces a non-string attribute value for any registered component, matching AppNode's Record<string, string> contract", () => {
    for (const tag of componentTagList) {
      const instance = createDesignComponentInstance(tag, "test-id")
      for (const value of Object.values(instance.attributes)) {
        expect(typeof value).toBe("string")
      }
    }
  })
})
