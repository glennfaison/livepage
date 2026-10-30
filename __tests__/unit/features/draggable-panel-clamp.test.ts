import { clampPanelOffset } from "@/client/features/page-builder/use-draggable-panel"

const viewport = { width: 1000, height: 700 }
const anchor = { left: 300, top: 100, width: 400, height: 300 }

describe("clampPanelOffset", () => {
  it("leaves an offset that keeps the panel on screen unchanged", () => {
    expect(clampPanelOffset({ x: 50, y: -20 }, anchor, viewport, 12)).toEqual({ x: 50, y: -20 })
  })

  it("stops the panel at each viewport edge, minus the margin", () => {
    expect(clampPanelOffset({ x: -999, y: -999 }, anchor, viewport, 12)).toEqual({ x: -288, y: -88 })
    expect(clampPanelOffset({ x: 999, y: 999 }, anchor, viewport, 12)).toEqual({ x: 288, y: 288 })
  })

  it("is relative to the anchor, so a moved anchor shifts the limits", () => {
    const movedAnchor = { ...anchor, left: 500 }
    expect(clampPanelOffset({ x: 999, y: 0 }, movedAnchor, viewport, 12)).toEqual({ x: 88, y: 0 })
  })

  it("pins to the top-left margin when the panel is larger than the viewport", () => {
    const huge = { left: 0, top: 0, width: 1200, height: 900 }
    expect(clampPanelOffset({ x: 400, y: 400 }, huge, viewport, 12)).toEqual({ x: 12, y: 12 })
  })
})
