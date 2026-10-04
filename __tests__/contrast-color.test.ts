import {
  CONTRAST_DARK,
  CONTRAST_LIGHT,
  getContrastColorForBackground,
  parseCssColor,
} from "@/client/features/design-components/editor-controls/shared/contrast-color"

describe("contrast-color", () => {
  it("picks dark on light and light on dark", () => {
    expect(getContrastColorForBackground("#ffffff")).toBe(CONTRAST_DARK)
    expect(getContrastColorForBackground("rgb(11, 16, 23)")).toBe(CONTRAST_LIGHT)
    expect(getContrastColorForBackground("#0b1017")).toBe(CONTRAST_LIGHT)
  })
  it("handles transparent, percent and fallback", () => {
    expect(parseCssColor("rgba(0, 0, 0, 0)")).toBeNull()
    expect(parseCssColor("transparent")).toBeNull()
    expect(parseCssColor("rgb(100%, 0%, 0%)")).toEqual({ r: 255, g: 0, b: 0 })
    expect(getContrastColorForBackground(null, CONTRAST_LIGHT)).toBe(CONTRAST_LIGHT)
  })
  it("is idempotent", () => {
    expect(getContrastColorForBackground("#222")).toBe(getContrastColorForBackground("#222"))
  })
})
