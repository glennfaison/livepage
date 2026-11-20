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

  it.each([
    { name: "320px phone", vw: 320, vh: 568 },
    { name: "375px phone", vw: 375, vh: 667 },
    { name: "768px tablet", vw: 768, vh: 1024 },
  ])("keeps a narrow toolbar inside a $name viewport", ({ vw, vh }) => {
    const width = 48
    const height = 280
    const clamped = clampToolbarCenter(vw, vh / 2, width, height, vw, vh)
    const halfW = Math.min(width, vw - 16) / 2
    const halfH = Math.min(height, vh - 16) / 2
    expect(clamped.x).toBeGreaterThanOrEqual(8 + halfW)
    expect(clamped.x).toBeLessThanOrEqual(vw - 8 - halfW)
    expect(clamped.y).toBeGreaterThanOrEqual(8 + halfH)
    expect(clamped.y).toBeLessThanOrEqual(vh - 8 - halfH)
  })

  it.each([
    { name: "320px phone", vw: 320, vh: 568 },
    { name: "375px phone", vw: 375, vh: 667 },
    { name: "768px tablet", vw: 768, vh: 1024 },
  ])("clamps a toolbar wider than the $name viewport to stay inside", ({ vw, vh }) => {
    // Toolbar wider than the viewport (e.g. horizontal layout before wrap)
    const width = vw + 80
    const height = 48
    const clamped = clampToolbarCenter(vw / 2, vh / 2, width, height, vw, vh)
    // halfWidth is capped so the center stays within margin + half of available width
    const halfW = Math.min(width, vw - 16) / 2
    expect(clamped.x).toBeGreaterThanOrEqual(8 + halfW)
    expect(clamped.x).toBeLessThanOrEqual(vw - 8 - halfW)
    // Entire toolbar box (even if overflowing content) has center inside
    expect(clamped.x - halfW).toBeGreaterThanOrEqual(8 - 0.5) // floating tolerance
    expect(clamped.x + halfW).toBeLessThanOrEqual(vw - 8 + 0.5)
  })

  it("clamps when the toolbar is taller than the viewport (after wrapping)", () => {
    const vw = 375
    const vh = 400
    const width = 200
    const height = 500 // taller than viewport
    const clamped = clampToolbarCenter(vw / 2, vh / 2, width, height, vw, vh)
    const halfH = Math.min(height, vh - 16) / 2
    expect(clamped.y).toBeGreaterThanOrEqual(8 + halfH)
    expect(clamped.y).toBeLessThanOrEqual(vh - 8 - halfH)
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
