import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { getComponentInfo } from "@/features/design-components"
import { DesignComponentTag, DesignComponent } from "@/features/design-components/types"


// features/design-components/page-component.test.tsx

// Mock the context
const mockAddComponent = jest.fn()
const mockSetSelectedComponent = jest.fn()
const mockUpdateComponent = jest.fn()

jest.mock("@/lib/component-operations-context", () => ({
  useComponentOperationsContext: () => ({
    addComponent: mockAddComponent,
    setSelectedComponent: mockSetSelectedComponent,
    updateComponent: mockUpdateComponent,
  }),
}))

const componentInfo = getComponentInfo("page")
const Component = componentInfo.Component

describe("page-component", () => {
  beforeEach(() => {
    mockAddComponent.mockClear()
    mockSetSelectedComponent.mockClear()
    mockUpdateComponent.mockClear()
  })

  it('appends a new row as the last child when "Add Row" is clicked', async () => {
    const user = userEvent.setup()
    // Initial children
    const children: DesignComponent<DesignComponentTag>[] = [
      { tag: "row", attributes: { id: "row-1", }, children: [] },
      { tag: "row", attributes: { id: "row-2", }, children: [] },
    ]
    const currentPage = {
      tag: "page",
      attributes: { id: "page-1", title: "Test Page" },
      children,
    } as DesignComponent<"page">

    render(
      <Component
        pageBuilderMode="edit"
        component={currentPage}
      />
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

    // Simulate the effect: addComponent would append a new row to children
    // const newRow = { tag: "row", attributes: { id: "row-3", }, children: [] }
    // const updatedPage = {
    //   ...currentPage,
    //   children: [...children, newRow],
    // }

    // // Re-render with updated children
    // render(
    //   <Component
    //     pageBuilderMode="edit"
    //     component={updatedPage}
    //   />
    // )

    // Get all rendered children
    const renderedRows = screen.getAllByText("row")
    // The last one should be the new row
    expect(renderedRows[renderedRows.length - 1].parentElement).toHaveAttribute("data-testid", "child-row-3")
  })
})