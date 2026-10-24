import { fireEvent, render } from "@testing-library/react"
import React from "react"
import { DIVIDER_THICKNESS_PX, DividerOverlay } from "@/client/features/design-components/editor-controls/layout-divider"
import { DragDropProvider } from "@/client/features/design-components/editor-controls"
import type { ElementBox } from "@/client/features/design-components/editor-controls/shared/use-element-box"

jest.mock("@/client/features/design-components/editor-controls/component-selector-popover", () => ({
  ComponentSelectorPopover: ({
    children,
    onOpenChange,
  }: {
    children: React.ReactNode
    onOpenChange?: (open: boolean) => void
  }) => (
    <>
      {children}
      <button type="button" data-testid="toggle-popover" onClick={() => onOpenChange?.(true)} />
    </>
  ),
}))

const box: ElementBox = { top: 100, left: 200, width: 120, height: 60, radius: "0px" }

/** Hit area is the bar plus 4px on each side. */
const HIT_AREA = DIVIDER_THICKNESS_PX + 8
const HALF_HIT = HIT_AREA / 2

const dividerButton = () => document.body.querySelector("button[aria-label='Add component here']") as HTMLElement
const innerBar = () => document.body.querySelector("button[aria-label='Add component here'] > div") as HTMLElement

type OverlayProps = Partial<React.ComponentProps<typeof DividerOverlay>>

const renderOverlay = (props: OverlayProps = {}) => {
  const release = jest.fn()
  const onHold = jest.fn(() => release)
  const utils = render(
    <DragDropProvider moveComponent={() => {}}>
      <DividerOverlay
        orientation="vertical"
        edge="start"
        box={box}
        onAddComponent={jest.fn()}
        onHold={onHold}
        parentTag="row"
        parentId="test"
        insertIndex={0}
        {...props}
      />
    </DragDropProvider>,
  )
  return { ...utils, onHold, release }
}

describe("DividerOverlay position math", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("places a vertical start-edge divider at the child's left edge", () => {
    renderOverlay({ orientation: "vertical", edge: "start", insertIndex: 0 })
    const button = dividerButton()
    expect(button.style.position).toBe("absolute")
    expect(button.style.left).toBe(`${200 - HALF_HIT}px`)
    expect(button.style.top).toBe("100px")
    expect(button.style.width).toBe(`${HIT_AREA}px`)
    expect(button.style.height).toBe("60px")
  })

  it("places a vertical end-edge divider at the child's right edge", () => {
    renderOverlay({ orientation: "vertical", edge: "end", insertIndex: 1 })
    const button = dividerButton()
    expect(button.style.left).toBe(`${200 + 120 - HALF_HIT}px`)
    expect(button.style.top).toBe("100px")
    expect(button.style.width).toBe(`${HIT_AREA}px`)
    expect(button.style.height).toBe("60px")
  })

  it("places a horizontal start-edge divider at the child's top edge", () => {
    renderOverlay({ orientation: "horizontal", edge: "start", parentTag: "column", insertIndex: 0 })
    const button = dividerButton()
    expect(button.style.left).toBe("200px")
    expect(button.style.top).toBe(`${100 - HALF_HIT}px`)
    expect(button.style.width).toBe("120px")
    expect(button.style.height).toBe(`${HIT_AREA}px`)
  })

  it("places a horizontal end-edge divider at the child's bottom edge", () => {
    renderOverlay({ orientation: "horizontal", edge: "end", parentTag: "column", insertIndex: 1 })
    const button = dividerButton()
    expect(button.style.left).toBe("200px")
    expect(button.style.top).toBe(`${100 + 60 - HALF_HIT}px`)
    expect(button.style.width).toBe("120px")
    expect(button.style.height).toBe(`${HIT_AREA}px`)
  })

  it("renders a bar of DIVIDER_THICKNESS_PX centered inside the wider hit area", () => {
    renderOverlay()
    const bar = innerBar()
    expect(bar.style.width).toBe(`${DIVIDER_THICKNESS_PX}px`)
    expect(bar.style.height).toBe("100%")
    expect(bar.style.position).toBe("absolute")
    expect(bar.style.left).toBe("50%")
    expect(bar.style.transform).toBe("translateX(-50%)")
  })

  it("draws a bar thicker than the previous 2px", () => {
    expect(DIVIDER_THICKNESS_PX).toBeGreaterThan(2)
  })

  it("gives the bar an accessible name", () => {
    renderOverlay()
    expect(dividerButton().getAttribute("aria-label")).toBe("Add component here")
  })
})

describe("DividerOverlay visibility and hold", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("is drawn as soon as it is mounted, without the pointer being on it", () => {
    renderOverlay()
    expect(dividerButton().classList.contains("opacity-0")).toBe(false)
  })

  it("does not hold its divider until the pointer is on it", () => {
    const { onHold } = renderOverlay()
    expect(onHold).not.toHaveBeenCalled()
  })

  it("holds its divider (by axis and insertion index) while the pointer is on it, and releases on leave", () => {
    const { onHold, release } = renderOverlay({ orientation: "horizontal", edge: "end", parentTag: "column", insertIndex: 3 })

    fireEvent.mouseEnter(dividerButton())
    expect(onHold).toHaveBeenCalledTimes(1)
    expect(onHold).toHaveBeenCalledWith("h", 3)
    expect(release).not.toHaveBeenCalled()

    fireEvent.mouseLeave(dividerButton())
    expect(release).toHaveBeenCalledTimes(1)
  })

  it("holds its divider while the popover is open even if the pointer is elsewhere", () => {
    const { onHold, release } = renderOverlay({ insertIndex: 2 })

    fireEvent.click(document.body.querySelector("[data-testid='toggle-popover']") as HTMLElement)
    expect(onHold).toHaveBeenCalledWith("v", 2)
    expect(release).not.toHaveBeenCalled()
  })

  it("releases its hold when it unmounts while still hovered", () => {
    const { release, unmount } = renderOverlay()

    fireEvent.mouseEnter(dividerButton())
    expect(release).not.toHaveBeenCalled()

    unmount()
    expect(release).toHaveBeenCalledTimes(1)
  })
})
