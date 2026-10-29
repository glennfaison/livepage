import { createDesignComponentInstance } from "./registry"

describe("createDesignComponentInstance default attributes (issue #333)", () => {
  it("stores button disabled as a string", () => {
    const button = createDesignComponentInstance("button", "1")
    expect(button.attributes.disabled).toBe("false")
    expect(typeof button.attributes.disabled).toBe("string")
  })

  it("stores image opacity as a string", () => {
    const image = createDesignComponentInstance("image", "1")
    expect(image.attributes.opacity).toBe("1")
    expect(typeof image.attributes.opacity).toBe("string")
  })

  it("stores page custom* defaults as strings", () => {
    const page = createDesignComponentInstance("page", "1")
    expect(page.attributes.customHead).toBe("")
    expect(page.attributes.customCss).toBe("")
    expect(page.attributes.customJs).toBe("")
    expect(typeof page.attributes.customHead).toBe("string")
    expect(typeof page.attributes.customCss).toBe("string")
    expect(typeof page.attributes.customJs).toBe("string")
  })

  it("coerces every default attribute value to a string", () => {
    for (const tag of ["button", "image", "page"]) {
      const component = createDesignComponentInstance(tag, "1")
      for (const value of Object.values(component.attributes)) {
        expect(typeof value).toBe("string")
      }
    }
  })
})
