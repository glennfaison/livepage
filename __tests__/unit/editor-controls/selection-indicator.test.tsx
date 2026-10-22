import React from "react"
import "@testing-library/jest-dom"
import { act, fireEvent, render, screen } from "@testing-library/react"
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
  return <span style={{ borderRadius: "8px" }}>probe</span>
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

// jsdom has no layout, so every element reports an empty rectangle unless the test gives it one.
const BOX = { top: 20, left: 10, width: 100, height: 40 }
function mockBox(box: { top: number; left: number; width: number; height: number } | null) {
  const rect = box
    ? { ...box, x: box.left, y: box.top, right: box.left + box.width, bottom: box.top + box.height, toJSON: () => ({}) }
    : { top: 0, left: 0, width: 0, height: 0, x: 0, y: 0, right: 0, bottom: 0, toJSON: () => ({}) }
  return jest.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(rect as DOMRect)
}

describe("selection indicator", () => {
  beforeEach(() => {
    mockBox(BOX)
    Object.defineProperty(window, "scrollX", { value: 0, configurable: true })
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true })
  })
  afterEach(() => jest.restoreAllMocks())

  it("marks the selected component in edit mode without a layout border", () => {
    renderWrapped("paragraph-1")
    const selected = document.querySelector("[data-component-id='paragraph-1']")
    expect(selected).toHaveAttribute("data-selected", "true")
    expect(selected).toHaveAttribute("aria-selected", "true")
    const outline = screen.getByTestId("editor-outline")
    expect(outline).toHaveAttribute("data-selected", "true")
    expect(outline.className).toContain("outline-primary")
    expect(outline.className).not.toContain("border-primary")
    expect(screen.getByTestId("component-settings-trigger")).toBeInTheDocument()
  })

  describe("layout neutrality (ADR 0016)", () => {
    it("wraps the component in an element with no box of its own", () => {
      renderWrapped("paragraph-1")
      const wrapper = document.querySelector("[data-component-id='paragraph-1']") as HTMLElement
      expect(wrapper).toHaveStyle({ display: "contents" })
      const classes = wrapper.className.split(/\s+/)
      expect(classes).not.toContain("block")
      expect(classes).not.toContain("relative")
      expect(wrapper.className).not.toContain("outline")
      // Only the component is inside the wrapper; the chrome is elsewhere.
      expect(wrapper.children).toHaveLength(1)
      expect(wrapper.firstElementChild).toHaveTextContent("probe")
    })

    it("draws the chrome in an overlay portalled to document.body", () => {
      renderWrapped("paragraph-1")
      const overlay = screen.getByTestId("editor-overlay")
      expect(overlay.parentElement).toBe(document.body)
      expect(document.querySelector("[data-component-id='paragraph-1']")).not.toContainElement(overlay)
      // The overlay never takes pointer events from the page; only the toolbar does.
      expect(overlay.className).toContain("pointer-events-none")
      expect(screen.getByTestId("editor-controls").parentElement?.className).toContain("pointer-events-auto")
    })

    it("positions the overlay from the component's box plus the page scroll", () => {
      Object.defineProperty(window, "scrollY", { value: 300, configurable: true })
      Object.defineProperty(window, "scrollX", { value: 5, configurable: true })
      renderWrapped("paragraph-1")
      expect(screen.getByTestId("editor-overlay")).toHaveStyle({ top: "320px", left: "15px", width: "100px", height: "40px" })
    })

    it("makes the outline follow the component's border radius", () => {
      renderWrapped("paragraph-1")
      expect(screen.getByTestId("editor-outline")).toHaveStyle({ borderRadius: "8px" })
    })

    it("shows a faint outline without the toolbar while hovered, and removes it on leave", () => {
      renderWrapped("other-component")
      expect(screen.queryByTestId("editor-overlay")).not.toBeInTheDocument()
      const wrapper = document.querySelector("[data-component-id='paragraph-1']") as HTMLElement
      fireEvent.mouseEnter(wrapper)
      const outline = screen.getByTestId("editor-outline")
      expect(outline).toHaveAttribute("data-selected", "false")
      expect(outline.className).toContain("outline-muted-foreground/50")
      expect(screen.queryByTestId("editor-controls")).not.toBeInTheDocument()
      fireEvent.mouseLeave(wrapper)
      expect(screen.queryByTestId("editor-overlay")).not.toBeInTheDocument()
    })

    it("draws nothing for a component that has no box, such as a hidden one", () => {
      jest.restoreAllMocks()
      mockBox(null)
      renderWrapped("paragraph-1")
      expect(screen.queryByTestId("editor-overlay")).not.toBeInTheDocument()
      expect(document.querySelector("[data-component-id='paragraph-1']")).toHaveAttribute("data-selected", "true")
    })

    it("selects the component when its wrapper is clicked, and still forwards hover handlers", () => {
      const setSelectedComponent = jest.fn()
      const onMouseMove = jest.fn()
      const onMouseLeave = jest.fn()
      const props = { component, pageBuilderMode: "edit", selectedComponentId: "", selectedComponentAncestors: [], parentTag: "column", onMouseMove, onMouseLeave } as unknown as EditModeProps
      render(
        <ComponentOperationsContext.Provider value={{ setSelectedComponent } as never}>
          <Wrapped {...props} />
        </ComponentOperationsContext.Provider>
      )
      const wrapper = document.querySelector("[data-component-id='paragraph-1']") as HTMLElement
      fireEvent.click(screen.getByText("probe"))
      expect(setSelectedComponent).toHaveBeenCalledWith("paragraph-1")
      fireEvent.mouseMove(screen.getByText("probe"))
      expect(onMouseMove).toHaveBeenCalled()
      fireEvent.mouseLeave(wrapper)
      expect(onMouseLeave).toHaveBeenCalled()
    })
  })

  it("does not show selection chrome in preview mode", () => {
    renderWrapped("paragraph-1", "preview")
    const selected = document.querySelector("[data-component-id='paragraph-1']")
    expect(selected).toHaveAttribute("data-selected", "false")
    expect(screen.queryByTestId("editor-overlay")).not.toBeInTheDocument()
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
    it("anchors the toolbar above the selected component, flush with its outline's right edge", () => {
      renderWrapped("paragraph-1")
      const anchor = screen.getByTestId("editor-controls").parentElement
      const classes = anchor?.className.split(/\s+/) ?? []
      expect(classes).toEqual(expect.arrayContaining(["absolute", "bottom-full", "-right-1"]))
      // Anchoring to the top edge would draw the toolbar over the component's content.
      expect(classes).not.toContain("top-0")
      // The outline extends 4px (0.25rem) past the component; -right-1 is that same 4px.
      expect(classes).not.toContain("right-0")
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
