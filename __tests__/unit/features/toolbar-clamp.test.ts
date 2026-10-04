import { clampToolbarCenter } from "@/client/features/page-builder/toolbar"

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
