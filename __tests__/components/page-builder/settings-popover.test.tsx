import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SettingsPopover } from "@/features/page-builder/settings-popover"
import { Button } from "@/components/ui/button"
import { createDesignComponentInstance, getComponentInfo } from "@/features/design-components"
import { appSettings } from "@/app/app-settings"
import { encodeDataSourceSettings } from "@/features/data-sources"

const mockUpdateComponent = jest.fn()

jest.mock("@/lib/component-operations-context", () => ({
  useComponentOperationsContext: () => ({
    updateComponent: mockUpdateComponent,
    setSelectedComponent: jest.fn(),
    addComponent: jest.fn(),
    removeComponent: jest.fn(),
    duplicateComponent: jest.fn(),
    replaceComponent: jest.fn(),
    findComponentById: jest.fn(),
  }),
}))

describe("SettingsPopover", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the trigger element", () => {
    const designComponentData = createDesignComponentInstance('header1', 'header1-2345')
    render(
      <SettingsPopover component={designComponentData}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    expect(screen.getByTestId("settings-trigger")).toBeInTheDocument()
  })

  it("opens the popover when trigger is clicked", async () => {
    const designComponentData = createDesignComponentInstance('header1', 'header1-2345')
    render(
      <SettingsPopover component={designComponentData}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    await waitFor(() => {
      expect(screen.getByText("Header 1")).toBeInTheDocument()
    })
  })

  it("displays settings fields with current values", async () => {
    const designComponentData = createDesignComponentInstance('header1', 'header1-2345')
    const defaultContentArray = getComponentInfo(designComponentData.tag).defaultChildren
    const defaultContent = Array.isArray(defaultContentArray) ? String(defaultContentArray) : String(defaultContentArray)
    render(
      <SettingsPopover component={designComponentData}>
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
    const designComponentData = createDesignComponentInstance('header1', 'header1-2345')
    render(
      <SettingsPopover component={designComponentData}>
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

  it("locks the back button and shows Update/Disconnect for connected data sources", async () => {
    const designComponentData = createDesignComponentInstance('header1', 'header1-2345')
    designComponentData.attributes = {
      ...designComponentData.attributes,
      [appSettings.dataSources.dataSourceFieldName]: encodeDataSourceSettings({
        id: "rest-api",
        settings: {
          url: "https://example.com",
          "parse-result": "return data",
        },
      }),
    }

    render(
      <SettingsPopover component={designComponentData}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))
    await userEvent.click(screen.getByTestId("data-sources-tab-trigger"))

    const backButton = screen.getByRole("button", { name: /back to data source list/i })
    expect(backButton).toBeDisabled()
    expect(screen.getByRole("button", { name: "Update" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "Disconnect" })).toBeEnabled()
  })

  it("enables back navigation and connect/disconnect state while preparing a new connection", async () => {
    const designComponentData = createDesignComponentInstance('header1', 'header1-2345')

    render(
      <SettingsPopover component={designComponentData}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))
    await userEvent.click(screen.getByTestId("data-sources-tab-trigger"))
    await userEvent.click(screen.getByRole("button", { name: "REST API" }))

    const backButton = screen.getByRole("button", { name: /back to data source list/i })
    expect(backButton).toBeEnabled()
    expect(screen.getByRole("button", { name: "Connect" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "Disconnect" })).toBeDisabled()
  })

  it("calls updateComponent with updated values when Save button is clicked", async () => {
    const designComponentData = createDesignComponentInstance('header1', 'header1-2345')
    render(
      <SettingsPopover component={designComponentData}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    const contentInput = screen.getByLabelText("Content")
    await userEvent.clear(contentInput)
    await userEvent.type(contentInput, "Updated Header")

    await userEvent.click(screen.getByRole("button", { name: "Save" }))

    expect(mockUpdateComponent).toHaveBeenCalledWith(designComponentData.attributes.id, expect.objectContaining({ children: ["Updated Header"] }))
  })

  it("resets to default values when field is cleared and saved", async () => {
    const designComponentData = createDesignComponentInstance('header1', 'header1-2345')
    const defaultContent = getComponentInfo(designComponentData.tag).defaultChildren
    render(
      <SettingsPopover component={designComponentData}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    const contentInput = screen.getByLabelText("Content")
    await userEvent.clear(contentInput)

    await userEvent.click(screen.getByRole("button", { name: "Save" }))

    expect(mockUpdateComponent).toHaveBeenCalledWith(designComponentData.attributes.id, expect.objectContaining({ children: defaultContent }))
  })

  it("discards changes when Discard button is clicked", async () => {
    const designComponentData = createDesignComponentInstance('header1', 'header1-2345')
    const defaultContentArray = getComponentInfo(designComponentData.tag).defaultChildren
    const defaultContent = Array.isArray(defaultContentArray) ? String(defaultContentArray) : String(defaultContentArray)
    render(
      <SettingsPopover component={designComponentData}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    const contentInput = screen.getByLabelText("Content")
    await userEvent.clear(contentInput)
    await userEvent.type(contentInput, "Updated Header")

    await userEvent.click(screen.getByRole("button", { name: "Discard" }))

    expect(mockUpdateComponent).not.toHaveBeenCalled()

    // Reopen the popover to check if values were reset
    await userEvent.click(screen.getByTestId("settings-trigger"))

    await waitFor(() => {
      const newContentInput = screen.getByLabelText("Content")
      expect(newContentInput).toHaveValue(defaultContent)
    })
  })
})
