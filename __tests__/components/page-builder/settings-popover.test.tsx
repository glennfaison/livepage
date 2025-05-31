import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SettingsPopover } from "@/components/page-builder/settings-popover"
import { getComponentInfo } from "@/components/design-components"
import { Button } from "@/components/ui/button"

// Mock the component info
jest.mock("@/components/design-components", () => ({
  getComponentInfo: jest.fn(),
}))

describe("SettingsPopover", () => {
  const mockComponent = {
    id: "test-component-id",
    tag: "header1" as const,
    attributes: {
      content: "Test Header",
    },
    children: [],
    settingsFields: {
      content: {
        id: "content",
        type: "text",
        label: "Content",
        placeholder: "Enter header text",
      },
    },
  }

  const mockComponentInfo = {
    tag: "header1",
    label: "Header 1",
    defaultAttributes: {
      content: "Default Header",
    },
    settingsFields: {
      content: {
        id: "content",
        type: "text",
        label: "Content",
        placeholder: "Enter header text",
      },
    },
  }

  const mockOnSave = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getComponentInfo as jest.Mock).mockReturnValue(mockComponentInfo)
  })

  it("renders the trigger element", () => {
    render(
      <SettingsPopover component={mockComponent} onSave={mockOnSave}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    expect(screen.getByTestId("settings-trigger")).toBeInTheDocument()
  })

  it("opens the popover when trigger is clicked", async () => {
    render(
      <SettingsPopover component={mockComponent} onSave={mockOnSave}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    await waitFor(() => {
      expect(screen.getByText("Header 1")).toBeInTheDocument()
    })
  })

  it("displays settings fields with current values", async () => {
    render(
      <SettingsPopover component={mockComponent} onSave={mockOnSave}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    await waitFor(() => {
      const contentInput = screen.getByLabelText("Content")
      expect(contentInput).toBeInTheDocument()
      expect(contentInput).toHaveValue("Test Header")
    })
  })

  it("switches between settings and connect tabs", async () => {
    render(
      <SettingsPopover component={mockComponent} onSave={mockOnSave}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    // Default tab is settings
    expect(screen.getByLabelText("Content")).toBeInTheDocument()

    // Switch to connect tab
    await userEvent.click(screen.getByRole("button", { name: "Connect" }))

    expect(screen.getByText("Connect Feature")).toBeInTheDocument()
    expect(screen.queryByLabelText("Content")).not.toBeInTheDocument()

    // Switch back to settings tab
    await userEvent.click(screen.getByTestId("settings-tab-trigger"))

    expect(screen.getByLabelText("Content")).toBeInTheDocument()
  })

  it("calls onSave with updated values when Save button is clicked", async () => {
    render(
      <SettingsPopover component={mockComponent} onSave={mockOnSave}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    const contentInput = screen.getByLabelText("Content")
    await userEvent.clear(contentInput)
    await userEvent.type(contentInput, "Updated Header")

    await userEvent.click(screen.getByRole("button", { name: "Save" }))

    expect(mockOnSave).toHaveBeenCalledWith({
      content: "Updated Header",
    })
  })

  it("resets to default values when field is cleared and saved", async () => {
    render(
      <SettingsPopover component={mockComponent} onSave={mockOnSave}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    const contentInput = screen.getByLabelText("Content")
    await userEvent.clear(contentInput)

    await userEvent.click(screen.getByRole("button", { name: "Save" }))

    expect(mockOnSave).toHaveBeenCalledWith({
      content: "Default Header",
    })
  })

  it("discards changes when Discard button is clicked", async () => {
    render(
      <SettingsPopover component={mockComponent} onSave={mockOnSave}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    const contentInput = screen.getByLabelText("Content")
    await userEvent.clear(contentInput)
    await userEvent.type(contentInput, "Updated Header")

    await userEvent.click(screen.getByRole("button", { name: "Discard" }))

    expect(mockOnSave).not.toHaveBeenCalled()

    // Reopen the popover to check if values were reset
    await userEvent.click(screen.getByTestId("settings-trigger"))

    await waitFor(() => {
      const newContentInput = screen.getByLabelText("Content")
      expect(newContentInput).toHaveValue("Test Header")
    })
  })
})
