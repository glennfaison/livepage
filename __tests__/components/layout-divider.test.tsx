import { render } from "@testing-library/react"
import React from "react"
import { DividerOverlay } from "@/client/features/design-components/editor-controls/layout-divider"
import { DragDropProvider } from "@/client/features/design-components/editor-controls"
import type { ElementBox } from "@/client/features/design-components/editor-controls/shared/use-element-box"

jest.mock("@/client/features/design-components/editor-controls/component-selector-popover", () => ({
  ComponentSelectorPopover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const box: ElementBox = { top: 100, left: 200, width: 120, height: 60, radius: "0px" }

const dividerButton = () => document.body.querySelector("button[aria-label='Add component here']") as HTMLElement
const innerBar = () => document.body.querySelector("button[aria-label='Add component here'] > div") as HTMLElement

describe("DividerOverlay position math", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("places a vertical start-edge divider at the child's left edge", () => {
    render(
      <DragDropProvider moveComponent={() => {}}>
        <DividerOverlay orientation="vertical" edge="start" box={box} onAddComponent={jest.fn()} parentTag="row" parentId="test" insertIndex={0} />
      </DragDropProvider>,
    )
    const button = dividerButton()
    expect(button.style.position).toBe("absolute")
    expect(button.style.left).toBe("196px") // 200 + 0 - 4
    expect(button.style.top).toBe("100px")
    expect(button.style.width).toBe("8px")
    expect(button.style.height).toBe("60px")
  })

  it("places a vertical end-edge divider at the child's right edge", () => {
    render(
      <DragDropProvider moveComponent={() => {}}>
        <DividerOverlay orientation="vertical" edge="end" box={box} onAddComponent={jest.fn()} parentTag="row" parentId="test" insertIndex={1} />
      </DragDropProvider>,
    )
    const button = dividerButton()
    expect(button.style.left).toBe("316px") // 200 + 120 - 4
    expect(button.style.top).toBe("100px")
    expect(button.style.width).toBe("8px")
    expect(button.style.height).toBe("60px")
  })

  it("places a horizontal start-edge divider at the child's top edge", () => {
    render(
      <DragDropProvider moveComponent={() => {}}>
        <DividerOverlay orientation="horizontal" edge="start" box={box} onAddComponent={jest.fn()} parentTag="column" parentId="test" insertIndex={0} />
      </DragDropProvider>,
    )
    const button = dividerButton()
    expect(button.style.left).toBe("200px")
    expect(button.style.top).toBe("96px") // 100 + 0 - 4
    expect(button.style.width).toBe("120px")
    expect(button.style.height).toBe("8px")
  })

  it("places a horizontal end-edge divider at the child's bottom edge", () => {
    render(
      <DragDropProvider moveComponent={() => {}}>
        <DividerOverlay orientation="horizontal" edge="end" box={box} onAddComponent={jest.fn()} parentTag="column" parentId="test" insertIndex={1} />
      </DragDropProvider>,
    )
    const button = dividerButton()
    expect(button.style.left).toBe("200px")
    expect(button.style.top).toBe("156px") // 100 + 60 - 4
    expect(button.style.width).toBe("120px")
    expect(button.style.height).toBe("8px")
  })

  it("renders a 2px thick bar centered inside the wider hit area", () => {
    render(
      <DragDropProvider moveComponent={() => {}}>
        <DividerOverlay orientation="vertical" edge="start" box={box} onAddComponent={jest.fn()} parentTag="row" parentId="test" insertIndex={0} />
      </DragDropProvider>,
    )
    const bar = innerBar()
    expect(bar.style.width).toBe("2px")
    expect(bar.style.height).toBe("100%")
    expect(bar.style.position).toBe("absolute")
    expect(bar.style.left).toBe("50%")
    expect(bar.style.transform).toBe("translateX(-50%)")
  })

  it("gives the bar an accessible name", () => {
    render(
      <DragDropProvider moveComponent={() => {}}>
        <DividerOverlay orientation="vertical" edge="start" box={box} onAddComponent={jest.fn()} parentTag="row" parentId="test" insertIndex={0} />
      </DragDropProvider>,
    )
    expect(dividerButton().getAttribute("aria-label")).toBe("Add component here")
  })
})
