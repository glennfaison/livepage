"use client"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { componentMetadataByTag, getComponentInfo } from "@/client/features/design-components"
import { ComponentSelectorPopover } from "@/client/features/page-builder"
import { Button } from "@/client/components/ui/button"

describe("ComponentSelectorPopover", () => {
  const mockOnSelect = jest.fn()

  it("renders the trigger element", () => {
    render(
      <ComponentSelectorPopover onSelect={mockOnSelect} parentTag="page">
        <Button data-testid="trigger-button">Add Component</Button>
      </ComponentSelectorPopover>,
    )

    expect(screen.getByTestId("trigger-button")).toBeInTheDocument()
  })

  it("opens the popover when trigger is clicked", async () => {
    render(
      <ComponentSelectorPopover onSelect={mockOnSelect} parentTag="page">
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
      <ComponentSelectorPopover onSelect={mockOnSelect} parentTag="page">
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
      <ComponentSelectorPopover onSelect={mockOnSelect} parentTag="page">
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
      <ComponentSelectorPopover onSelect={mockOnSelect} parentTag="page">
        <Button data-testid="trigger-button">Add Component</Button>
      </ComponentSelectorPopover>,
    )

    await userEvent.click(screen.getByTestId("trigger-button"))
    await userEvent.click(screen.getByText("Header 1"))

    expect(mockOnSelect).toHaveBeenCalledWith("header1")
  })

  it('shows "No components found" when search has no results', async () => {
    render(
      <ComponentSelectorPopover onSelect={mockOnSelect} parentTag="page">
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

  it("exposes registered component metadata from the public API", () => {
    expect(getComponentInfo("header1").label).toBe("Header 1")
  })

  it("exposes registered metadata in a map keyed by its tag", () => {
    for (const [tag, metadata] of Object.entries(componentMetadataByTag)) {
      expect(metadata.tag).toBe(tag)
    }
  })

  it("allows pages only inside future site and directory containers", () => {
    expect(componentMetadataByTag.page.allowedParentTags).toEqual(["site", "directory"])
  })

  it("does not offer pages as children of pages", async () => {
    render(
      <ComponentSelectorPopover onSelect={mockOnSelect} parentTag="page">
        <Button data-testid="trigger-button">Add Component</Button>
      </ComponentSelectorPopover>,
    )

    await userEvent.click(screen.getByTestId("trigger-button"))

    await waitFor(() => {
      expect(screen.getByText("Select Component")).toBeInTheDocument()
      expect(screen.queryByText("Page")).not.toBeInTheDocument()
    })
  })

  it("excludes the current design component from replacement choices", async () => {
    render(
      <ComponentSelectorPopover onSelect={mockOnSelect} parentTag="page" excludeTag="header1">
        <Button data-testid="trigger-button">Replace Component</Button>
      </ComponentSelectorPopover>,
    )

    await userEvent.click(screen.getByTestId("trigger-button"))

    await waitFor(() => {
      expect(screen.queryByText("Header 1")).not.toBeInTheDocument()
      expect(screen.getByText("Paragraph")).toBeInTheDocument()
    })
  })
})
