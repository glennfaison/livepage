import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { getComponentInfo } from "@/client/features/design-components"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppNode } from "@/client/features/app-state"
import { DragDropProvider } from "@/client/features/design-components/editor-controls"


// features/design-components/page-component.test.tsx

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
const Component = componentInfo.EditModeComponent

describe("page-component", () => {
  beforeEach(() => {
    mockAddComponent.mockClear()
    mockSetSelectedComponent.mockClear()
    mockUpdateComponent.mockClear()
  })

  it('appends a new row as the last child when "Add Row" is clicked', async () => {
    const user = userEvent.setup()
    // Initial children
    const children: AppNode[] = [
      { tag: "row", attributes: { id: "row-1", }, children: [] },
      { tag: "row", attributes: { id: "row-2", }, children: [] },
    ]
    const currentPage = {
      tag: "page",
      attributes: { id: "page-1", title: "Test Page" },
      children,
    } as AppNode

    const qc = new QueryClient()
    render(
      <QueryClientProvider client={qc}>
        <DragDropProvider moveComponent={() => {}}>
          <Component
            pageBuilderMode="edit"
            component={currentPage}
            selectedComponentId={""}
            selectedComponentAncestors={[]}
          />
        </DragDropProvider>
      </QueryClientProvider>
    )

    // Button should be present
    const addRowButton = screen.getByRole("button", { name: /add row/i })
    expect(addRowButton).toBeInTheDocument()

    // Click the button
    await user.click(addRowButton)

    // Should call addComponent with correct args
    expect(mockAddComponent).toHaveBeenCalledWith({
      tag: "row",
      parentId: "page-1",
    })

  })
})