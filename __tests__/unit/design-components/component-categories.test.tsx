import { componentMetadataByTag, getComponentsAllowedIn } from "@/client/features/design-components"
import type { ComponentCategory } from "@/client/features/types"

const COMPONENT_CATEGORIES: ReadonlyArray<ComponentCategory> = [
  "Layout",
  "Typography",
  "Media",
  "Data",
  "Feedback",
  "Navigation",
  "Other",
]

describe("design component categories", () => {
  it("gives every registered component one of the known categories", () => {
    const uncategorised = Object.entries(componentMetadataByTag).filter(
      ([, metadata]) => !COMPONENT_CATEGORIES.includes(metadata.category),
    )

    expect(uncategorised).toEqual([])
  })

  it("covers every category with at least one component", () => {
    const usedCategories = new Set(
      Object.values(componentMetadataByTag).map((metadata) => metadata.category),
    )

    expect([...usedCategories].sort()).toEqual([...COMPONENT_CATEGORIES].sort())
  })

  it("exposes categories through the insertable-component lookup the palette uses", () => {
    const insertable = getComponentsAllowedIn("page")
    const uncategorised = insertable.filter(({ category }) => !COMPONENT_CATEGORIES.includes(category))

    expect(insertable.length).toBeGreaterThan(0)
    expect(uncategorised).toEqual([])
  })
})
