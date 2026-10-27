import { componentMetadataByTag } from "@/client/features/design-components"
import type { Metadata } from "@/client/features/types"

describe("design component metadata completeness", () => {
  it("gives every registered component non-empty keywords and a description", () => {
    const incomplete = Object.entries(componentMetadataByTag).filter(
      ([, metadata]) =>
        !Array.isArray(metadata.keywords) ||
        metadata.keywords.length === 0 ||
        typeof metadata.description !== "string" ||
        metadata.description.trim().length === 0,
    )

    expect(incomplete).toEqual([])
  })

  it("defines an Icon for every registered component", () => {
    const missingIcon = Object.entries(componentMetadataByTag).filter(
      ([, metadata]) => metadata.Icon === null || metadata.Icon === undefined,
    )

    expect(missingIcon).toEqual([])
  })

  it("keeps defaultChildren as an array for every registered component", () => {
    const notArray = Object.entries(componentMetadataByTag).filter(
      ([, metadata]) => !Array.isArray(metadata.defaultChildren),
    )

    expect(notArray).toEqual([])
  })

  it("registers every component the metadata store can look up by tag", () => {
    const tags = Object.keys(componentMetadataByTag)

    expect(tags.length).toBeGreaterThan(0)
    tags.forEach((tag) => {
      const metadata: Metadata = componentMetadataByTag[tag]
      expect(metadata.tag).toBe(tag)
    })
  })
})
