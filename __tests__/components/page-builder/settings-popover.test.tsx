import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SettingsPopover } from "@/components/page-builder/settings-popover"
import { Button } from "@/components/ui/button"
import { createDesignComponent, getComponentInfo } from "@/features/design-components"

describe("SettingsPopover", () => {
  const mockOnSave = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the trigger element", () => {
    const designComponentData = createDesignComponent('header1', 'header1-2345')
    render(
      <SettingsPopover component={designComponentData} onSave={mockOnSave}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    expect(screen.getByTestId("settings-trigger")).toBeInTheDocument()
  })

  it("opens the popover when trigger is clicked", async () => {
    const designComponentData = createDesignComponent('header1', 'header1-2345')
    render(
      <SettingsPopover component={designComponentData} onSave={mockOnSave}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    await waitFor(() => {
      expect(screen.getByText("Header 1")).toBeInTheDocument()
    })
  })

  it("displays settings fields with current values", async () => {
    const designComponentData = createDesignComponent('header1', 'header1-2345')
    const defaultContent = getComponentInfo(designComponentData.tag).defaultAttributes.content
    render(
      <SettingsPopover component={designComponentData} onSave={mockOnSave}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    await waitFor(() => {
      const contentInput = screen.getByLabelText("Content")
      expect(contentInput).toBeInTheDocument()
      expect(contentInput).toHaveValue(defaultContent)
    })
  })

  it("switches between settings and connect tabs", async () => {
    const designComponentData = createDesignComponent('header1', 'header1-2345')
    render(
      <SettingsPopover component={designComponentData} onSave={mockOnSave}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    // Default tab is settings
    expect(screen.getByLabelText("Content")).toBeInTheDocument()

    // Switch to Data Sources tab
    await userEvent.click(screen.getByTestId("data-sources-tab-trigger"))

    expect(screen.getByText("Data Sources")).toBeInTheDocument()
    expect(screen.queryByLabelText("Content")).not.toBeInTheDocument()

    // Switch back to settings tab
    await userEvent.click(screen.getByTestId("settings-tab-trigger"))

    expect(screen.getByLabelText("Content")).toBeInTheDocument()
  })

  it("calls onSave with updated values when Save button is clicked", async () => {
    const designComponentData = createDesignComponent('header1', 'header1-2345')
    render(
      <SettingsPopover component={designComponentData} onSave={mockOnSave}>
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
    const designComponentData = createDesignComponent('header1', 'header1-2345')
    const defaultContent = getComponentInfo(designComponentData.tag).defaultAttributes.content
    render(
      <SettingsPopover component={designComponentData} onSave={mockOnSave}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    const contentInput = screen.getByLabelText("Content")
    await userEvent.clear(contentInput)

    await userEvent.click(screen.getByRole("button", { name: "Save" }))

    expect(mockOnSave).toHaveBeenCalledWith({
      content: defaultContent,
    })
  })

  it("discards changes when Discard button is clicked", async () => {
    const designComponentData = createDesignComponent('header1', 'header1-2345')
    const defaultContent = getComponentInfo(designComponentData.tag).defaultAttributes.content
    render(
      <SettingsPopover component={designComponentData} onSave={mockOnSave}>
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
      expect(newContentInput).toHaveValue(defaultContent)
    })
  })
})
