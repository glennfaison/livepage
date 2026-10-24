import { act, render } from "@testing-library/react"
import React from "react"
import { ComponentOperationsContext } from "@/client/features/design-components/editor-controls/component-operations-context"
import { DragDropProvider } from "@/client/features/design-components/editor-controls"
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
  const addComponent = jest.fn()

  const Harness = ({ orientation }: { orientation: DividerOrientation }) => {
    handlers = useLayoutDividers({ orientation, parentTag: "row", parentId: "row-1" })
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
})
