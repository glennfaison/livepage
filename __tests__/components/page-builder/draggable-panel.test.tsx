import { fireEvent, render, screen } from "@testing-library/react"
import { DraggablePanel } from "@/client/features/page-builder/draggable-panel"

const MARGIN = 12

function mockPanelRect(panel: HTMLElement, rect: { left: number; top: number; width: number; height: number }) {
  // jsdom does no layout. Report the rect a panel anchored at `rect` would have,
  // shifted by whatever translate the component has applied so far.
  jest.spyOn(panel, "getBoundingClientRect").mockImplementation(() => {
    const match = /translate3d\(([-\d.]+)px, ([-\d.]+)px/.exec(panel.style.transform)
    const dx = match ? Number(match[1]) : 0
    const dy = match ? Number(match[2]) : 0
    return {
      ...rect,
      left: rect.left + dx,
      top: rect.top + dy,
      right: rect.left + dx + rect.width,
      bottom: rect.top + dy + rect.height,
      x: rect.left + dx,
      y: rect.top + dy,
      toJSON: () => ({}),
    }
  })
}

function renderPanel() {
  render(
    <DraggablePanel header={<h2>Settings</h2>} dragLabel="Drag settings panel" viewportMargin={MARGIN}>
      <p>body</p>
    </DraggablePanel>,
  )
  const panel = screen.getByTestId("draggable-panel")
  mockPanelRect(panel, { left: 300, top: 100, width: 400, height: 300 })
  return { panel, grip: screen.getByRole("button", { name: "Drag settings panel" }) }
}

describe("DraggablePanel", () => {
  beforeAll(() => {
    // jsdom implements neither PointerEvent nor pointer capture. Without the
    // event class, fireEvent drops button/clientX/pointerId.
    class PointerEventPolyfill extends MouseEvent {
      readonly pointerId: number
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init)
        this.pointerId = init.pointerId ?? 0
      }
    }
    Object.defineProperty(window, "PointerEvent", { value: PointerEventPolyfill, configurable: true })
    Element.prototype.setPointerCapture = jest.fn()
    window.innerWidth = 1000
    window.innerHeight = 700
  })

  it("renders the grip before the header content", () => {
    const { grip } = renderPanel()
    expect(grip.nextElementSibling).toHaveTextContent("Settings")
  })

  it("moves with the pointer while the grip is held", () => {
    const { panel, grip } = renderPanel()

    fireEvent.pointerDown(grip, { button: 0, pointerId: 1, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(grip, { pointerId: 1, clientX: 140, clientY: 130 })
    expect(panel.style.transform).toBe("translate3d(40px, 30px, 0)")

    fireEvent.pointerUp(grip, { pointerId: 1 })
    fireEvent.pointerMove(grip, { pointerId: 1, clientX: 400, clientY: 400 })
    expect(panel.style.transform).toBe("translate3d(40px, 30px, 0)")
  })

  it("does not move for a press that is not the primary button", () => {
    const { panel, grip } = renderPanel()
    fireEvent.pointerDown(grip, { button: 2, pointerId: 1, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(grip, { pointerId: 1, clientX: 200, clientY: 200 })
    expect(panel.style.transform).toBe("translate3d(0px, 0px, 0)")
  })

  it("keeps the panel inside the viewport margin", () => {
    const { panel, grip } = renderPanel()
    fireEvent.pointerDown(grip, { button: 0, pointerId: 1, clientX: 0, clientY: 0 })
    fireEvent.pointerMove(grip, { pointerId: 1, clientX: -5000, clientY: -5000 })
    expect(panel.style.transform).toBe("translate3d(-288px, -88px, 0)")
    fireEvent.pointerMove(grip, { pointerId: 1, clientX: 5000, clientY: 5000 })
    expect(panel.style.transform).toBe("translate3d(288px, 288px, 0)")
  })

  it("nudges with the arrow keys and ignores other keys", () => {
    const { panel, grip } = renderPanel()
    fireEvent.keyDown(grip, { key: "ArrowRight" })
    fireEvent.keyDown(grip, { key: "ArrowDown" })
    expect(panel.style.transform).toBe("translate3d(16px, 16px, 0)")
    fireEvent.keyDown(grip, { key: "a" })
    expect(panel.style.transform).toBe("translate3d(16px, 16px, 0)")
  })

  it("returns to its anchor on double-click", () => {
    const { panel, grip } = renderPanel()
    fireEvent.keyDown(grip, { key: "ArrowLeft" })
    expect(panel.style.transform).toBe("translate3d(-16px, 0px, 0)")
    fireEvent.doubleClick(grip)
    expect(panel.style.transform).toBe("translate3d(0px, 0px, 0)")
  })
})
