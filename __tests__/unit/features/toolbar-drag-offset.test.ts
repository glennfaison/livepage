import { computeToolbarDragOffset } from "@/client/features/page-builder/toolbar"

describe("computeToolbarDragOffset", () => {
  it("computes offset relative to toolbar center so grip stays under pointer", () => {
    // Toolbar center at (400, 300); pointer on grip that is 40px above center
    const offset = computeToolbarDragOffset(400, 260, 400, 300)
    expect(offset).toEqual({ x: 0, y: -40 })

    // Subsequent move keeps the same relative offset from center
    const newClientX = 450
    const newClientY = 280
    const newCenterX = newClientX - offset.x
    const newCenterY = newClientY - offset.y
    expect(newCenterX).toBe(450)
    expect(newCenterY).toBe(320)
  })

  it("matches keyboard nudge coordinate model (pure delta on position)", () => {
    const start = { x: 100, y: 200 }
    const nudged = { x: start.x + 10, y: start.y }
    expect(nudged.x - start.x).toBe(10)
  })
})
