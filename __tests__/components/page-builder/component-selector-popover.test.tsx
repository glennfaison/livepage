"use client"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@/features/design-component-runtime/registry"
import { ComponentLookupNotInitializedError } from "@/features/design-component-runtime/lookup"
import { ComponentSelectorPopover, getComponentInfoSafe } from "@/features/page-builder"
import { Button } from "@/components/ui/button"
import { componentTagList } from "@/features/design-component-runtime/component-tags"

describe("ComponentSelectorPopover", () => {
  const mockOnSelect = jest.fn()

  it("renders the trigger element", () => {
    render(
      <ComponentSelectorPopover onSelect={mockOnSelect} componentTagList={componentTagList}>
        <Button data-testid="trigger-button">Add Component</Button>
      </ComponentSelectorPopover>,
    )

    expect(screen.getByTestId("trigger-button")).toBeInTheDocument()
  })

  it("opens the popover when trigger is clicked", async () => {
    render(
      <ComponentSelectorPopover onSelect={mockOnSelect} componentTagList={componentTagList}>
        <Button data-testid="trigger-button">Add Component</Button>
      </ComponentSelectorPopover>,
    )

    await userEvent.click(screen.getByTestId("trigger-button"))

    await waitFor(() => {
      expect(screen.getByText("Select Component")).toBeInTheDocument()
    })
  })

  it("displays all components in the grid", async () => {
    render(
      <ComponentSelectorPopover onSelect={mockOnSelect} componentTagList={componentTagList}>
        <Button data-testid="trigger-button">Add Component</Button>
      </ComponentSelectorPopover>,
    )

    await userEvent.click(screen.getByTestId("trigger-button"))

    await waitFor(() => {
      expect(screen.getByText("Header 1")).toBeInTheDocument()
      expect(screen.getByText("Paragraph")).toBeInTheDocument()
      expect(screen.getByText("Button")).toBeInTheDocument()
    })
  })

  it("filters components based on search term", async () => {
    render(
      <ComponentSelectorPopover onSelect={mockOnSelect} componentTagList={componentTagList}>
        <Button data-testid="trigger-button">Add Component</Button>
      </ComponentSelectorPopover>,
    )

    await userEvent.click(screen.getByTestId("trigger-button"))

    const searchInput = screen.getByPlaceholderText("Search components...")
    await userEvent.type(searchInput, "header")

    await waitFor(() => {
      expect(screen.getByText("Header 1")).toBeInTheDocument()
      expect(screen.queryByText("Paragraph")).not.toBeInTheDocument()
      expect(screen.queryByText("Button")).not.toBeInTheDocument()
    })
  })

  it("calls onSelect when a component is clicked", async () => {
    render(
      <ComponentSelectorPopover onSelect={mockOnSelect} componentTagList={componentTagList}>
        <Button data-testid="trigger-button">Add Component</Button>
      </ComponentSelectorPopover>,
    )

    await userEvent.click(screen.getByTestId("trigger-button"))
    await userEvent.click(screen.getByText("Header 1"))

    expect(mockOnSelect).toHaveBeenCalledWith("header1")
  })

  it('shows "No components found" when search has no results', async () => {
    render(
      <ComponentSelectorPopover onSelect={mockOnSelect} componentTagList={componentTagList}>
        <Button data-testid="trigger-button">Add Component</Button>
      </ComponentSelectorPopover>,
    )

    await userEvent.click(screen.getByTestId("trigger-button"))

    const searchInput = screen.getByPlaceholderText("Search components...")
    await userEvent.type(searchInput, "nonexistent")

    await waitFor(() => {
      expect(screen.getByText("No components found")).toBeInTheDocument()
    })
  })

  it("falls back to formatted labels when lookup is not initialized", async () => {
    expect(
      getComponentInfoSafe("header1", () => {
        throw new ComponentLookupNotInitializedError()
      }).label,
    ).toBe("Header 1")

    expect(
      getComponentInfoSafe("inline-text", () => {
        throw new ComponentLookupNotInitializedError()
      }).label,
    ).toBe("Inline Text")
  })
})
