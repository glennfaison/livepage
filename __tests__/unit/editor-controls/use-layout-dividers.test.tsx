import { act, render } from "@testing-library/react"
import React from "react"
import { ComponentOperationsContext } from "@/client/features/design-components/editor-controls/component-operations-context"
import { DragDropProvider, useDragDrop } from "@/client/features/design-components/editor-controls"
import { useLayoutDividers } from "@/client/features/design-components/editor-controls/use-layout-dividers"
import type { DividerOrientation } from "@/client/features/design-components/editor-controls/layout-divider"
import type { Operations } from "@/client/features/types"

jest.mock("@/client/features/design-components/editor-controls/component-selector-popover", () => ({
  ComponentSelectorPopover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

type Handlers = ReturnType<typeof useLayoutDividers>

/** A flex child with a fixed 100x40 box, placed 116px after the previous one (a 16px gap). */
const child = (index: number) => {
  const el = document.createElement("div")
  el.getBoundingClientRect = () =>
    ({ left: index * 116, top: 0, width: 100, height: 40, right: index * 116 + 100, bottom: 40, x: index * 116, y: 0 }) as DOMRect
  return el
}

const moveOver = (el: HTMLElement, clientX: number, clientY: number) => ({
  clientX,
  clientY,
  currentTarget: el,
}) as unknown as React.MouseEvent

describe("useLayoutDividers", () => {
  let handlers: Handlers
  let startDrag: ReturnType<typeof useDragDrop>["startDrag"]
  const addComponent = jest.fn()

  const Harness = ({ orientation }: { orientation: DividerOrientation }) => {
    handlers = useLayoutDividers({ orientation, parentTag: "row", parentId: "row-1" })
    startDrag = useDragDrop().startDrag
    return <>{handlers.dividers}</>
  }

  const mount = (orientation: DividerOrientation = "vertical") =>
    render(
      <ComponentOperationsContext.Provider value={{ addComponent } as unknown as Operations}>
        <DragDropProvider moveComponent={() => {}}>
          <Harness orientation={orientation} />
        </DragDropProvider>
      </ComponentOperationsContext.Provider>,
    )

  const overlays = () => document.body.querySelectorAll("button[aria-label='Add component here']")

  beforeEach(() => {
    jest.useFakeTimers()
    addComponent.mockClear()
  })

  afterEach(() => {
    jest.useRealTimers()
    document.body.innerHTML = ""
  })

  it("draws no overlay until the pointer is near a child edge", () => {
    mount()
    expect(overlays()).toHaveLength(0)
  })

  it("draws one overlay when the pointer is near a child's start edge", () => {
    mount()
    act(() => handlers.handleChildMouseMove(moveOver(child(1), 116 + 10, 20), 1))
    expect(overlays()).toHaveLength(1)
  })

  it("draws a single overlay for an insertion point shared by two neighbours, even with a gap between them", () => {
    mount()

    // Near the end of child 0 (insertion point 1), then near the start of child 1 (same point).
    act(() => handlers.handleChildMouseMove(moveOver(child(0), 95, 20), 0))
    act(() => handlers.handleChildMouseMove(moveOver(child(1), 116 + 5, 20), 1))

    expect(overlays()).toHaveLength(1)
    // It follows the pointer: anchored to child 1's start edge, not child 0's end edge.
    const left = Number.parseFloat((overlays()[0] as HTMLElement).style.left)
    expect(left).toBeCloseTo(116 - 6, 0)
  })

  it("draws separate overlays for different insertion points", () => {
    mount()
    act(() => handlers.handleChildMouseMove(moveOver(child(0), 5, 20), 0))
    act(() => handlers.handleChildMouseMove(moveOver(child(1), 116 + 95, 20), 1))
    expect(overlays()).toHaveLength(2)
  })

  it("removes the overlay a hide delay after the pointer leaves", () => {
    mount()
    act(() => handlers.handleChildMouseMove(moveOver(child(0), 5, 20), 0))
    expect(overlays()).toHaveLength(1)

    act(() => handlers.handleChildMouseLeave(0))
    act(() => {
      jest.advanceTimersByTime(1100)
    })
    expect(overlays()).toHaveLength(0)
  })

  it("lays horizontal dividers out for a column", () => {
    mount("horizontal")
    act(() => handlers.handleChildMouseMove(moveOver(child(0), 50, 3), 0))
    expect(overlays()).toHaveLength(1)
    expect((overlays()[0] as HTMLElement).style.height).toBe("12px")
  })

  describe("while a component is dragged", () => {
    const dragOver = (el: HTMLElement, clientX: number, clientY: number) => moveOver(el, clientX, clientY) as unknown as React.DragEvent

    it("draws no divider for a drag over a child when nothing is being dragged", () => {
      mount()
      act(() => handlers.handleChildDragOver(dragOver(child(0), 5, 20), 0))
      expect(overlays()).toHaveLength(0)
    })

    it("draws the divider nearest the pointer, since browsers fire no mouse events during a drag", () => {
      mount()
      act(() => startDrag("dragged", "row"))
      act(() => handlers.handleChildDragOver(dragOver(child(1), 116 + 95, 20), 1))
      expect(overlays()).toHaveLength(1)
      expect(Number.parseFloat((overlays()[0] as HTMLElement).style.left)).toBeCloseTo(116 + 100 - 6, 0)
    })

    it("offers no drop positions in the layout that is itself being dragged", () => {
      mount()
      act(() => startDrag("row-1", "row"))
      act(() => handlers.handleChildDragOver(dragOver(child(0), 5, 20), 0))
      expect(overlays()).toHaveLength(0)
    })

    it("hides the divider a hide delay after the drag leaves the child", () => {
      mount()
      act(() => startDrag("dragged", "row"))
      act(() => handlers.handleChildDragOver(dragOver(child(0), 5, 20), 0))
      expect(overlays()).toHaveLength(1)

      act(() => handlers.handleChildDragLeave(0))
      act(() => {
        jest.advanceTimersByTime(1100)
      })
      expect(overlays()).toHaveLength(0)
    })

    it("records a child's box even when the event comes from a display: contents wrapper", () => {
      mount()
      const wrapper = document.createElement("div")
      wrapper.style.display = "contents"
      const inner = child(1)
      wrapper.appendChild(inner)
      document.body.appendChild(wrapper)
      // jsdom does not implement `contents`, so report it the way a browser would.
      const original = window.getComputedStyle
      jest.spyOn(window, "getComputedStyle").mockImplementation((el, pseudo) => {
        const style = original(el, pseudo)
        return el === wrapper ? ({ ...style, display: "contents", borderRadius: "0px" } as CSSStyleDeclaration) : style
      })
      wrapper.getBoundingClientRect = () => ({ left: 0, top: 0, width: 0, height: 0 }) as DOMRect

      act(() => handlers.handleChildMouseMove(moveOver(wrapper, 116 + 5, 20), 1))

      expect(overlays()).toHaveLength(1)
      jest.restoreAllMocks()
    })
  })
})
