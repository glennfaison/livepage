import { render } from "@testing-library/react"
import React from "react"
import { Divider } from "@/client/features/design-components/editor-controls/layout-divider"
import { DragDropProvider } from "@/client/features/design-components/editor-controls"

jest.mock("@/client/features/design-components/editor-controls/component-selector-popover", () => ({
  ComponentSelectorPopover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe("Divider", () => {
  it("gives bar and button the same contrast color on a dark background", () => {
    const { container } = render(
      <DragDropProvider moveComponent={() => {}}>
        <div style={{ backgroundColor: "rgb(11, 16, 23)" }}>
          <Divider orientation="horizontal" parentTag={"row" as never} onAddComponent={jest.fn()} index={0} isVisible parentId="test" dividerIndex={0} />
        </div>
      </DragDropProvider>,
    )
    const bar = container.querySelector("div > div > div") as HTMLElement
    const button = container.querySelector("button") as HTMLElement
    expect(bar.style.backgroundColor).toBe("rgb(250, 250, 250)")
    expect(button.style.backgroundColor).toBe("rgb(250, 250, 250)")
    expect(button.style.color).toBe("rgb(24, 24, 27)")
    expect(bar.className).not.toMatch(/bg-gray-400|bg-primary/)
  })
})

describe("Divider thickness (ADR 0014)", () => {
  const renderBar = (orientation: "horizontal" | "vertical", isVisible = true) => {
    const { container } = render(
      <DragDropProvider moveComponent={() => {}}>
        <Divider orientation={orientation} parentTag={"row" as never} onAddComponent={jest.fn()} index={0} isVisible={isVisible} parentId="test" dividerIndex={0} />
      </DragDropProvider>,
    )
    return container.querySelector("div > div") as HTMLElement
  }

  it("pins a vertical divider to a fixed, non-flexing width", () => {
    const bar = renderBar("vertical")
    expect(bar.style.width).toBe("2px")
    expect(bar.style.minWidth).toBe("2px")
    expect(bar.style.maxWidth).toBe("2px")
    expect(bar.style.flex).toBe("0 0 2px")
  })

  it("pins a horizontal divider to a fixed, non-flexing height", () => {
    const bar = renderBar("horizontal")
    expect(bar.style.height).toBe("2px")
    expect(bar.style.minHeight).toBe("2px")
    expect(bar.style.maxHeight).toBe("2px")
    expect(bar.style.flex).toBe("0 0 2px")
  })

  it("does not use spacing utilities for thickness", () => {
    expect(renderBar("vertical").className).not.toMatch(/(^|\s)(w|h|min-w|min-h)-/)
  })

  it("takes the + button out of flow so it cannot widen the bar", () => {
    const bar = renderBar("vertical")
    expect(bar.querySelector("button")?.className).toMatch(/\babsolute\b/)
  })

  it("adds no inline thickness while hidden", () => {
    const bar = renderBar("vertical", false)
    expect(bar.style.width).toBe("")
    expect(bar.className).toMatch(/size-0/)
  })
})
