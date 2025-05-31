"use client"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ComponentSelectorPopover } from "@/components/page-builder/component-selector-popover"
import { getComponentInfo } from "@/components/design-components"
import { Button } from "@/components/ui/button"
import { ComponentInfo, ComponentType } from "@/components/design-components/types"

// Mock the component info
jest.mock("@/components/design-components", () => ({
  getComponentInfo: jest.fn(),
}))

describe("ComponentSelectorPopover", () => {
  const mockComponentInfo: { [Key in ComponentType]: ComponentInfo<Key> } = {
    header1: {
      tag: "header1",
      label: "Header 1",
      keywords: ["h1", "title", "header"],
      Icon: <span data-testid="header1-icon">H1</span>,
      defaultAttributes: { content: "" },
      Component: () => <div />,
      settingsFields: { content: { id: "content", label: "", type: "text" }}
    },
    paragraph: {
      tag: "paragraph",
      label: "Paragraph",
      keywords: ["p", "text", "paragraph"],
      Icon: <span data-testid="paragraph-icon">P</span>,
      defaultAttributes: { content: "" },
      Component: () => <div />,
      settingsFields: { content: { id: "content", label: "", type: "text" }}
    },
    button: {
      tag: "button",
      label: "Button",
      keywords: ["button", "click"],
      Icon: <span data-testid="button-icon">Btn</span>,
      defaultAttributes: { content: "" },
      Component: () => <div />,
      settingsFields: { content: { id: "content", label: "", type: "text" }}
    },
  }

  const mockOnSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getComponentInfo as jest.Mock).mockImplementation((type) => mockComponentInfo[type as ComponentType])
  })

  it("renders the trigger element", () => {
    render(
      <ComponentSelectorPopover onSelect={mockOnSelect} componentInfo={mockComponentInfo}>
        <Button data-testid="trigger-button">Add Component</Button>
      </ComponentSelectorPopover>,
    )

    expect(screen.getByTestId("trigger-button")).toBeInTheDocument()
  })

  it("opens the popover when trigger is clicked", async () => {
    render(
      <ComponentSelectorPopover onSelect={mockOnSelect} componentInfo={mockComponentInfo}>
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
      <ComponentSelectorPopover onSelect={mockOnSelect} componentInfo={mockComponentInfo}>
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
      <ComponentSelectorPopover onSelect={mockOnSelect} componentInfo={mockComponentInfo}>
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
      <ComponentSelectorPopover onSelect={mockOnSelect} componentInfo={mockComponentInfo}>
        <Button data-testid="trigger-button">Add Component</Button>
      </ComponentSelectorPopover>,
    )

    await userEvent.click(screen.getByTestId("trigger-button"))
    await userEvent.click(screen.getByText("Header 1"))

    expect(mockOnSelect).toHaveBeenCalledWith("header1")
  })

  it('shows "No components found" when search has no results', async () => {
    render(
      <ComponentSelectorPopover onSelect={mockOnSelect} componentInfo={mockComponentInfo}>
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
})
