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

function renderWrapped(
  selectedComponentId: string,
  mode: "edit" | "preview" = "edit",
  selectedComponentAncestors: EditModeProps["selectedComponentAncestors"] = [],
) {
  const props = {
    component,
    pageBuilderMode: mode,
    selectedComponentId,
    selectedComponentAncestors,
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

  describe("editor controls placement", () => {
    it("anchors the toolbar above the top-right corner of the selected component", () => {
      renderWrapped("paragraph-1")
      const anchor = screen.getByTestId("editor-controls").parentElement
      const classes = anchor?.className.split(/\s+/) ?? []
      expect(classes).toEqual(expect.arrayContaining(["absolute", "bottom-full", "right-0"]))
      // Anchoring to the top edge would draw the toolbar over the component's content.
      expect(classes).not.toContain("top-0")
    })

    it("leaves a gap so the toolbar clears the selection outline", () => {
      renderWrapped("paragraph-1")
      const anchor = screen.getByTestId("editor-controls").parentElement
      expect(anchor?.className.split(/\s+/)).toContain("mb-2")
    })

    it("stacks ancestor labels above the toolbar rather than over the component", () => {
      const ancestor = { tag: "column", attributes: { id: "column-1" }, children: [] }
      renderWrapped("paragraph-1", "edit", [ancestor] as never)
      const toolbar = screen.getByTestId("editor-controls")
      const labels = toolbar.previousElementSibling as HTMLElement
      expect(labels.className.split(/\s+/)).toContain("bottom-[100%]")
      expect(labels).toHaveTextContent("Paragraph")
    })

    it("suppresses the component's native tooltip while hovering the toolbar", () => {
      renderWrapped("paragraph-1")
      // The selected wrapper carries a long `title`; an empty title on the toolbar
      // stops that tooltip from appearing over the content beneath the controls.
      expect(screen.getByTestId("editor-controls")).toHaveAttribute("title", "")
    })
  })
})
