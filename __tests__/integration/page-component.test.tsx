import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { getComponentInfo } from "@/client/features/design-components"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppNode } from "@/client/features/app-state"
import { DragDropProvider } from "@/client/features/design-components/editor-controls"

// Mock the context
const mockAddComponent = jest.fn()
const mockSetSelectedComponent = jest.fn()
const mockUpdateComponent = jest.fn()

jest.mock("@/client/features/design-components/editor-controls/component-operations-context", () => ({
  useComponentOperationsContext: () => ({
    addComponent: mockAddComponent,
    setSelectedComponent: mockSetSelectedComponent,
    updateComponent: mockUpdateComponent,
  }),
}))

const componentInfo = getComponentInfo("page")
const EditComponent = componentInfo.EditModeComponent
const PreviewComponent = componentInfo.PreviewModeComponent

function renderEdit(page: AppNode, pageBuilderMode: "edit" | "preview" = "edit") {
  const qc = new QueryClient()
  return render(
    <QueryClientProvider client={qc}>
      <DragDropProvider moveComponent={() => {}}>
        <EditComponent
          pageBuilderMode={pageBuilderMode}
          component={page}
          selectedComponentId={""}
          selectedComponentAncestors={[]}
        />
      </DragDropProvider>
    </QueryClientProvider>
  )
}

function basePage(children: AppNode[] = []): AppNode {
  return {
    tag: "page",
    attributes: { id: "page-1", title: "Test Page" },
    children,
  } as AppNode
}

describe("page-component", () => {
  beforeEach(() => {
    mockAddComponent.mockClear()
    mockSetSelectedComponent.mockClear()
    mockUpdateComponent.mockClear()
  })

  it('appends a new row as the last child when "Add Row" is clicked', async () => {
    const user = userEvent.setup()
    const children: AppNode[] = [
      { tag: "row", attributes: { id: "row-1" }, children: [] },
      { tag: "row", attributes: { id: "row-2" }, children: [] },
    ]
    renderEdit(basePage(children))

    const addRowButton = screen.getByRole("button", { name: /add row/i })
    expect(addRowButton).toBeInTheDocument()

    await user.click(addRowButton)

    expect(mockAddComponent).toHaveBeenCalledWith({
      tag: "row",
      parentId: "page-1",
    })
  })

  describe("theme-aware surfaces (issue #138)", () => {
    it("uses semantic theme tokens for the canvas and card in edit mode", () => {
      const { container } = renderEdit(basePage())

      const section = container.querySelector("section")
      expect(section).toBeTruthy()
      expect(section!.className).toContain("bg-muted")
      expect(section!.className).not.toMatch(/bg-gray-50|bg-white/)

      // The page card is the direct child div of the section
      const card = section!.querySelector(":scope > div")
      expect(card).toBeTruthy()
      expect(card!.className).toContain("bg-card")
      expect(card!.className).toContain("border-border")
      expect(card!.className).not.toMatch(/bg-white|bg-gray-/)
    })

    it("uses semantic theme tokens for the canvas and card in preview mode", () => {
      const qc = new QueryClient()
      const { container } = render(
        <QueryClientProvider client={qc}>
          <PreviewComponent
            pageBuilderMode="preview"
            component={basePage()}
            selectedComponentId={""}
            selectedComponentAncestors={[]}
          />
        </QueryClientProvider>
      )

      const section = container.querySelector("section")
      expect(section).toBeTruthy()
      expect(section!.className).toContain("bg-muted")
      expect(section!.className).not.toMatch(/bg-gray-50|bg-white/)

      const card = section!.querySelector(":scope > div")
      expect(card).toBeTruthy()
      expect(card!.className).toContain("bg-card")
      expect(card!.className).toContain("border-border")
      expect(card!.className).not.toMatch(/bg-white|bg-gray-/)
    })

    it("uses a theme-aware dashed border for the empty drop zone in edit mode", () => {
      renderEdit(basePage())

      // The empty-state drop target is the dashed border region that holds "Add Row"
      const addRowButton = screen.getByRole("button", { name: /add row/i })
      const dropZone = addRowButton.closest("div")
      expect(dropZone).toBeTruthy()
      expect(dropZone!.className).toContain("border-border")
      expect(dropZone!.className).toContain("border-dashed")
      expect(dropZone!.className).not.toMatch(/border-gray-/)
    })

    it("does not apply the dashed empty-state border in preview mode", () => {
      renderEdit(basePage(), "preview")

      const addRowButton = screen.getByRole("button", { name: /add row/i })
      const dropZone = addRowButton.closest("div")
      expect(dropZone).toBeTruthy()
      // In preview mode the dashed edit-only border class is not applied
      expect(dropZone!.className).not.toContain("border-dashed")
    })
  })
})
