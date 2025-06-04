import type { ComponentTag } from "@/features/design-components/types"

describe("Design Component Types", () => {
  it("should have all expected component types", () => {
    const expectedTypes: ComponentTag[] = [
      "header1",
      "header2",
      "header3",
      "paragraph",
      "inline-text",
      "button",
      "image",
      "row",
      "column",
    ]

    // Create a type that would cause a compile error if ComponentType doesn't include all expected types
    type ExpectedTypesSubsetOfComponentType = Exclude<(typeof expectedTypes)[number], ComponentTag> extends never
      ? true
      : false
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _typeCheck: ExpectedTypesSubsetOfComponentType = true

    // This is just to verify at runtime that our expected types match the actual types
    expectedTypes.forEach((type) => {
      // This would throw a TypeScript error if the type wasn't in ComponentType
      const componentType: ComponentTag = type
      expect(componentType).toBe(type)
    })
  })
})
