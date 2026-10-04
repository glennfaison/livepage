import { render } from "@testing-library/react"
import React from "react"
import { Divider } from "@/client/features/design-components/editor-controls/layout-divider"

jest.mock("@/client/features/design-components/editor-controls/component-selector-popover", () => ({
  ComponentSelectorPopover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe("Divider", () => {
  it("gives bar and button the same contrast color on a dark background", () => {
    const { container } = render(
      <div style={{ backgroundColor: "rgb(11, 16, 23)" }}>
        <Divider orientation="horizontal" parentTag={"row" as never} onAddComponent={jest.fn()} index={0} isVisible />
      </div>,
    )
    const bar = container.querySelector("div > div > div") as HTMLElement
    const button = container.querySelector("button") as HTMLElement
    expect(bar.style.backgroundColor).toBe("rgb(250, 250, 250)")
    expect(button.style.backgroundColor).toBe("rgb(250, 250, 250)")
    expect(button.style.color).toBe("rgb(24, 24, 27)")
    expect(bar.className).not.toMatch(/bg-gray-400|bg-primary/)
  })
})
