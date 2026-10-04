import { editorChromeButtonClassName, editorChromeSurfaceClassName } from "@/client/features/design-components/editor-controls/shared/editor-chrome"

describe("editor chrome contrast", () => {
  it("pairs a surface background with a matching foreground so inherited page text cannot wash out the controls", () => {
    expect(editorChromeSurfaceClassName).toContain("bg-popover")
    expect(editorChromeSurfaceClassName).toContain("text-popover-foreground")
    expect(editorChromeSurfaceClassName).toContain("border")
    expect(editorChromeSurfaceClassName).toContain("shadow-md")
    expect(editorChromeSurfaceClassName).not.toContain("bg-background")
  })

  it("keeps control icons on the popover foreground instead of theme primary", () => {
    expect(editorChromeButtonClassName).toContain("text-popover-foreground")
    expect(editorChromeButtonClassName).not.toContain("text-primary")
  })
})
