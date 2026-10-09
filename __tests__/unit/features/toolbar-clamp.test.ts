import { clampToolbarCenter, assertToolbarButtonBalance } from "@/client/features/page-builder/toolbar"

describe("clampToolbarCenter", () => {
  it("keeps a toolbar centered near the right edge inside a phone viewport", () => {
    const clamped = clampToolbarCenter(320, 400, 220, 360, 320, 640)
    expect(clamped.x).toBeGreaterThanOrEqual(8 + 110)
    expect(clamped.x).toBeLessThanOrEqual(320 - 8 - 110)
    expect(clamped.y).toBeGreaterThanOrEqual(8 + 180)
    expect(clamped.y).toBeLessThanOrEqual(640 - 8 - 180)
  })

  it("leaves an already visible desktop position unchanged", () => {
    expect(clampToolbarCenter(900, 400, 48, 280, 1280, 800)).toEqual({ x: 900, y: 400 })
  })
})

describe("assertToolbarButtonBalance", () => {
  it("accepts a balanced row (L - R of -1, 0, or 1)", () => {
    expect(() => assertToolbarButtonBalance(0, 1)).not.toThrow()
    expect(() => assertToolbarButtonBalance(1, 1)).not.toThrow()
    expect(() => assertToolbarButtonBalance(5, 4)).not.toThrow()
    expect(() => assertToolbarButtonBalance(4, 5)).not.toThrow()
  })

  it("rejects an unbalanced row", () => {
    expect(() => assertToolbarButtonBalance(5, 3)).toThrow(/Toolbar button imbalance/)
    expect(() => assertToolbarButtonBalance(0, 2)).toThrow(/Toolbar button imbalance/)
  })
})