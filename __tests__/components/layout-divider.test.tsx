import { render } from "@testing-library/react"
import React from "react"
import { Divider, getDividerLayoutStyle, resolveMainAxisGap } from "@/client/features/design-components/editor-controls/layout-divider"
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
  const renderBar = (orientation: "horizontal" | "vertical", isVisible = true, gap?: string | number) => {
    const { container } = render(
      <DragDropProvider moveComponent={() => {}}>
        <Divider orientation={orientation} parentTag={"row" as never} onAddComponent={jest.fn()} index={0} isVisible={isVisible} parentId="test" dividerIndex={0} gap={gap} />
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

describe("Divider layout neutrality (issue #431)", () => {
  const renderBar = (orientation: "horizontal" | "vertical", isVisible: boolean, gap?: string | number) => {
    const { container } = render(
      <DragDropProvider moveComponent={() => {}}>
        <Divider orientation={orientation} parentTag={"row" as never} onAddComponent={jest.fn()} index={0} isVisible={isVisible} parentId="test" dividerIndex={0} gap={gap} />
      </DragDropProvider>,
    )
    return container.querySelector("div > div") as HTMLElement
  }

  it("takes a hidden divider out of flow so it adds no flex gap and no justify-content slot", () => {
    const bar = renderBar("vertical", false, "1rem")
    expect(bar.style.position).toBe("absolute")
    expect(bar.style.marginLeft).toBe("")
    expect(bar.style.marginRight).toBe("")
    expect(bar.className).not.toMatch(/(^|\s)relative(\s|$)/)
  })

  it("keeps a shown divider in flow and cancels the gap and thickness around it", () => {
    // jsdom discards calc() margins, so the margin values are asserted on the style helper below.
    const bar = renderBar("vertical", true, "1rem")
    expect(bar.style.position).toBe("")
    expect(bar.style.width).toBe("2px")
    expect(bar.className).toMatch(/(^|\s)relative(\s|$)/)
    const style = getDividerLayoutStyle("vertical", true, "1rem")
    expect(style.marginLeft).toBe("calc((1rem + 2px) / -2)")
    expect(style.marginRight).toBe("calc((1rem + 2px) / -2)")
  })

  it("compensates on the vertical axis for a horizontal divider", () => {
    const style = getDividerLayoutStyle("horizontal", true, "8px")
    expect(style.marginTop).toBe("calc((8px + 2px) / -2)")
    expect(style.marginBottom).toBe("calc((8px + 2px) / -2)")
    expect(style.marginLeft).toBeUndefined()
    expect(style.marginRight).toBeUndefined()
  })

  it("still subtracts only its own thickness when the parent has no gap", () => {
    expect(getDividerLayoutStyle("vertical", true).marginLeft).toBe("calc((0px + 2px) / -2)")
    expect(getDividerLayoutStyle("vertical", true, "0").marginLeft).toBe("calc((0px + 2px) / -2)")
  })

  it("does not leave stale thickness or margins behind when a shown divider hides again", () => {
    const { container, rerender } = render(
      <DragDropProvider moveComponent={() => {}}>
        <Divider orientation="vertical" parentTag={"row" as never} onAddComponent={jest.fn()} index={0} isVisible parentId="test" dividerIndex={0} gap="1rem" />
      </DragDropProvider>,
    )
    const bar = container.querySelector("div > div") as HTMLElement
    expect(bar.style.width).toBe("2px")
    rerender(
      <DragDropProvider moveComponent={() => {}}>
        <Divider orientation="vertical" parentTag={"row" as never} onAddComponent={jest.fn()} index={0} isVisible={false} parentId="test" dividerIndex={0} gap="1rem" />
      </DragDropProvider>,
    )
    expect(bar.style.width).toBe("")
    expect(bar.style.minWidth).toBe("")
    expect(bar.style.marginLeft).toBe("")
    expect(bar.style.position).toBe("absolute")
  })
})

describe("resolveMainAxisGap", () => {
  it.each([
    [undefined, "vertical", "0px"],
    ["", "vertical", "0px"],
    ["1rem", "vertical", "1rem"],
    [16, "vertical", "16px"],
    [0, "vertical", "0px"],
    ["0", "vertical", "0px"],
    ["normal", "horizontal", "0px"],
    ["16", "vertical", "0px"],
    ["inherit", "vertical", "0px"],
    ["var(--space)", "vertical", "var(--space)"],
    ["calc(1rem + 2px)", "horizontal", "calc(1rem + 2px)"],
  ] as const)("resolves %p for a %s divider to %p", (gap, orientation, expected) => {
    expect(resolveMainAxisGap(gap, orientation)).toBe(expected)
  })

  it("uses column-gap (second value) for vertical dividers and row-gap (first) for horizontal ones", () => {
    expect(resolveMainAxisGap("10px 20px", "vertical")).toBe("20px")
    expect(resolveMainAxisGap("10px 20px", "horizontal")).toBe("10px")
    expect(resolveMainAxisGap("calc(1rem + 2px) 4px", "vertical")).toBe("4px")
  })

  it("falls back to 0px for values browsers would reject", () => {
    expect(resolveMainAxisGap("1px 2px 3px", "vertical")).toBe("0px")
  })
})

describe("getDividerLayoutStyle", () => {
  it("never produces layout properties other than position while hidden", () => {
    expect(getDividerLayoutStyle("vertical", false, "2rem")).toEqual({ position: "absolute" })
  })
})
