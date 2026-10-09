import React from "react"
import "@testing-library/jest-dom"
import { act, render, screen } from "@testing-library/react"
import { withEditorControls } from "@/client/features/design-components/editor-controls/decorators/with-editor-controls"
import { ComponentOperationsContext } from "@/client/features/design-components/editor-controls/component-operations-context"
import { OPEN_COMPONENT_SETTINGS_EVENT } from "@/client/features/design-components/editor-controls/shared/editor-chrome"
import type { EditModeProps } from "@/client/features/types"

jest.mock("@/client/features/design-components/registry-store", () => ({
  getComponentInfo: () => ({ label: "Paragraph", attributes: [] }),
}))

jest.mock("@/client/features/design-components/primitives", () => ({
  getAccessibilityAttributes: () => ({ "aria-label": "Paragraph" }),
}))

jest.mock("@/client/features/design-components/editor-controls/drag-drop-context", () => ({
  useDragDrop: () => ({ startDrag: jest.fn(), endDrag: jest.fn() }),
}))

jest.mock("@/client/features/design-components/editor-controls/settings-popover", () => ({
  SettingsPopover: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (
    <div data-testid="settings-popover" data-open={open ? "true" : "false"}>{children}</div>
  ),
}))

jest.mock("@/client/features/design-components/editor-controls/replace-with-popover", () => ({
  ReplaceWithPopover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const component = {
  tag: "paragraph",
  attributes: { id: "paragraph-1" },
  children: ["Hello"],
}

function Probe() {
  return <span>probe</span>
}

const Wrapped = withEditorControls(Probe)

function renderWrapped(selectedComponentId: string, mode: "edit" | "preview" = "edit") {
  const props = {
    component,
    pageBuilderMode: mode,
    selectedComponentId,
    selectedComponentAncestors: [],
    parentTag: "column",
  } as EditModeProps
  return render(
    <ComponentOperationsContext.Provider value={{ setSelectedComponent: jest.fn() } as never}>
      <Wrapped {...props} />
    </ComponentOperationsContext.Provider>
  )
}

describe("selection indicator", () => {
  it("marks the selected component in edit mode without a layout border", () => {
    renderWrapped("paragraph-1")
    const selected = document.querySelector("[data-component-id='paragraph-1']")
    expect(selected).toHaveAttribute("data-selected", "true")
    expect(selected).toHaveAttribute("aria-selected", "true")
    expect(selected?.className).toContain("outline-primary")
    expect(selected?.className).not.toContain("border-primary")
    expect(screen.getByTestId("component-settings-trigger")).toBeInTheDocument()
  })

  it("does not show selection chrome in preview mode", () => {
    renderWrapped("paragraph-1", "preview")
    const selected = document.querySelector("[data-component-id='paragraph-1']")
    expect(selected).toHaveAttribute("data-selected", "false")
    expect(selected?.className).not.toContain("outline-primary")
    expect(screen.queryByTestId("component-settings-trigger")).not.toBeInTheDocument()
  })

  it("opens settings when the toolbar event targets the selected component", () => {
    renderWrapped("paragraph-1")
    act(() => {
      window.dispatchEvent(new CustomEvent(OPEN_COMPONENT_SETTINGS_EVENT, { detail: "paragraph-1" }))
    })
    expect(screen.getByTestId("settings-popover")).toHaveAttribute("data-open", "true")
  })
})
