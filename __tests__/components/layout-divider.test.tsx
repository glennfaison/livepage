import { fireEvent, render } from "@testing-library/react"
import React from "react"
import {
  DIVIDER_BADGE_PX,
  DIVIDER_THICKNESS_PX,
  DividerOverlay,
  measureBackgroundAt,
} from "@/client/features/design-components/editor-controls/layout-divider"
import { DragDropProvider, useDragDrop } from "@/client/features/design-components/editor-controls"
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

describe("DividerOverlay add badge", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  const badge = () => document.body.querySelector("[data-testid='divider-add-badge']") as HTMLElement

  it("draws the + on a solid round badge inside the clickable button", () => {
    renderOverlay()
    expect(badge().parentElement).toBe(dividerButton())
    expect(badge().className).toContain("rounded-full")
    expect(badge().style.width).toBe(`${DIVIDER_BADGE_PX}px`)
    expect(badge().style.height).toBe(`${DIVIDER_BADGE_PX}px`)
    expect(badge().querySelector("svg")).not.toBeNull()
  })

  it("fills the badge with the bar color and draws the + in the opposite color", () => {
    renderOverlay()
    const barColor = innerBar().style.backgroundColor
    expect(barColor).not.toBe("")
    expect(badge().style.backgroundColor).toBe(barColor)
    expect(badge().style.color).not.toBe("")
    expect(badge().style.color).not.toBe(barColor)
  })

  it("keeps the badge out of the accessibility tree so the button's own name is announced", () => {
    renderOverlay()
    expect(badge().getAttribute("aria-hidden")).toBe("true")
  })

  it("lets a click on the badge reach the button", () => {
    const onHold = jest.fn(() => jest.fn())
    renderOverlay({ onHold })
    fireEvent.mouseEnter(badge())
    expect(onHold).toHaveBeenCalled()
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

  it("holds its divider (by insertion index) while the pointer is on it, and releases on leave", () => {
    const { onHold, release } = renderOverlay({ orientation: "horizontal", edge: "end", parentTag: "column", insertIndex: 3 })

    fireEvent.mouseEnter(dividerButton())
    expect(onHold).toHaveBeenCalledTimes(1)
    expect(onHold).toHaveBeenCalledWith(3)
    expect(release).not.toHaveBeenCalled()

    fireEvent.mouseLeave(dividerButton())
    expect(release).toHaveBeenCalledTimes(1)
  })

  it("holds its divider while the popover is open even if the pointer is elsewhere", () => {
    const { onHold, release } = renderOverlay({ insertIndex: 2 })

    fireEvent.click(document.body.querySelector("[data-testid='toggle-popover']") as HTMLElement)
    expect(onHold).toHaveBeenCalledWith(2)
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

describe("divider color follows the page under the bar", () => {
  const original = (document as { elementsFromPoint?: unknown }).elementsFromPoint

  const stubStack = (stack: Element[]) => {
    ;(document as unknown as { elementsFromPoint: (x: number, y: number) => Element[] }).elementsFromPoint = jest.fn(() => stack)
  }

  const section = (background: string, parent: HTMLElement = document.body) => {
    const el = document.createElement("div")
    el.style.backgroundColor = background
    parent.appendChild(el)
    return el
  }

  afterEach(() => {
    ;(document as { elementsFromPoint?: unknown }).elementsFromPoint = original
    document.body.innerHTML = ""
  })

  it("returns the background of the element under the point", () => {
    stubStack([section("rgb(27, 27, 24)")])
    expect(measureBackgroundAt(10, 10)).toBe("rgb(27, 27, 24)")
  })

  it("walks up from a transparent element to the first ancestor that paints a background", () => {
    const dark = section("rgb(10, 20, 30)")
    const transparentChild = section("transparent", dark)
    stubStack([transparentChild])
    expect(measureBackgroundAt(10, 10)).toBe("rgb(10, 20, 30)")
  })

  it("looks through editor chrome drawn on top of the page", () => {
    const page = section("rgb(1, 2, 3)")
    const chrome = section("rgb(250, 250, 250)")
    chrome.setAttribute("data-editor-chrome", "true")
    const chromeChild = section("rgb(250, 250, 250)", chrome)
    stubStack([chromeChild, chrome, page])
    expect(measureBackgroundAt(10, 10)).toBe("rgb(1, 2, 3)")
  })

  it("returns null when elementsFromPoint is unavailable", () => {
    ;(document as { elementsFromPoint?: unknown }).elementsFromPoint = undefined
    expect(measureBackgroundAt(10, 10)).toBeNull()
  })

  it("samples the page 1px inside the hovered child's start edge", () => {
    stubStack([section("rgb(255, 255, 255)")])
    renderOverlay({ orientation: "vertical", edge: "start" })
    expect(document.elementsFromPoint).toHaveBeenCalledWith(200 + 1, 100 + 60 / 2)
  })

  it("samples the page 1px inside the hovered child's end edge", () => {
    stubStack([section("rgb(255, 255, 255)")])
    renderOverlay({ orientation: "horizontal", edge: "end", parentTag: "column" })
    expect(document.elementsFromPoint).toHaveBeenCalledWith(200 + 120 / 2, 100 + 60 - 1)
  })

  it("draws a light bar and a light badge over a dark section", () => {
    stubStack([section("rgb(27, 27, 24)")])
    renderOverlay()
    expect(innerBar().style.backgroundColor).toBe("rgb(250, 250, 250)")
    expect((document.body.querySelector("[data-testid='divider-add-badge']") as HTMLElement).style.backgroundColor).toBe(
      "rgb(250, 250, 250)",
    )
  })

  it("draws a dark bar over a light section", () => {
    stubStack([section("rgb(255, 255, 255)")])
    renderOverlay()
    expect(innerBar().style.backgroundColor).toBe("rgb(24, 24, 27)")
  })
})

describe("DividerOverlay as a drop target", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  const StartDrag = () => {
    const { startDrag } = useDragDrop()
    return <button type="button" data-testid="start-drag" onClick={() => startDrag("dragged", "row")} />
  }

  const renderTwoDividers = () => {
    const release = jest.fn()
    const onHold = jest.fn(() => release)
    const base = { orientation: "vertical", edge: "start", box, onAddComponent: jest.fn(), onHold, parentTag: "row", parentId: "row-1" } as const
    const utils = render(
      <DragDropProvider moveComponent={() => {}}>
        <StartDrag />
        <DividerOverlay {...base} insertIndex={1} />
        <DividerOverlay {...base} insertIndex={2} />
      </DragDropProvider>,
    )
    fireEvent.click(document.body.querySelector("[data-testid='start-drag']") as HTMLElement)
    const [first, second] = Array.from(document.body.querySelectorAll("button[aria-label='Add component here']")) as HTMLElement[]
    return { ...utils, first, second, onHold, release }
  }

  const over = (el: HTMLElement) => fireEvent.dragOver(el, { dataTransfer: { dropEffect: "" } })

  it("highlights only the divider being dragged over, not every divider in the layout", () => {
    const { first, second } = renderTwoDividers()

    over(second)

    expect(second.className).toContain("ring-primary")
    expect(first.className).not.toContain("ring-primary")
  })

  it("holds its divider while it is the drop target, with the pointer resting on it", () => {
    const { second, onHold } = renderTwoDividers()
    expect(onHold).not.toHaveBeenCalled()

    over(second)

    expect(onHold).toHaveBeenCalledWith(2)
  })

  it("stops being the drop target, and releases its hold, when the drag leaves", () => {
    const { first, second, release } = renderTwoDividers()
    over(second)

    fireEvent.dragLeave(second, { relatedTarget: document.body })

    expect(second.className).not.toContain("ring-primary")
    expect(release).toHaveBeenCalledTimes(1)
    expect(first.className).not.toContain("ring-primary")
  })

  it("does not become the drop target when nothing is being dragged", () => {
    const release = jest.fn()
    render(
      <DragDropProvider moveComponent={() => {}}>
        <DividerOverlay
          orientation="vertical"
          edge="start"
          box={box}
          onAddComponent={jest.fn()}
          onHold={jest.fn(() => release)}
          parentTag="row"
          parentId="row-1"
          insertIndex={1}
        />
      </DragDropProvider>,
    )
    const button = dividerButton()
    over(button)
    expect(button.className).not.toContain("ring-primary")
  })
})
