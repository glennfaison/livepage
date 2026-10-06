import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SettingsPopover } from "@/client/features/page-builder"
import { Button } from "@/client/components/ui/button"
import { createDesignComponentInstance, getComponentInfo } from "@/client/features/design-components"
import { encodeDataSourceSettings, DATA_SOURCE_FIELD_NAME } from "@/client/features/data-sources"

const mockUpdateComponent = jest.fn()

jest.mock("@/client/features/design-components/editor-controls/component-operations-context", () => ({
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
    const baseComponentData = createDesignComponentInstance("header1", "header1-2345")
    const designComponentData = {
      ...baseComponentData,
      attributes: {
      ...baseComponentData.attributes,
      [DATA_SOURCE_FIELD_NAME]: encodeDataSourceSettings({
        id: "rest-api",
        settings: {
          url: "https://example.com",
          "parse-result": "return data",
        },
      }),
      },
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

  it("displays templates tab with search and template cards", async () => {
    const designComponentData = createDesignComponentInstance('header1', 'header1-2345')
    render(
      <SettingsPopover component={designComponentData}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))

    // Switch to Templates tab
    await userEvent.click(screen.getByTestId("templates-tab-trigger"))

    // Check that template catalog heading is visible
    await waitFor(() => {
      expect(screen.getByText("Template catalog")).toBeInTheDocument()
    })

    // Check that search input is visible
    expect(screen.getByPlaceholderText("Search templates by name, tag, or category")).toBeInTheDocument()

    // Check that template cards are rendered (at least one)
    expect(screen.getByText("Personal CV / Resume")).toBeInTheDocument()
  })

  it("filters templates when searching", async () => {
    const designComponentData = createDesignComponentInstance('header1', 'header1-2345')
    render(
      <SettingsPopover component={designComponentData}>
        <Button data-testid="settings-trigger">Settings</Button>
      </SettingsPopover>,
    )

    await userEvent.click(screen.getByTestId("settings-trigger"))
    await userEvent.click(screen.getByTestId("templates-tab-trigger"))

    await waitFor(() => {
      expect(screen.getByText("Personal CV / Resume")).toBeInTheDocument()
    })

    // Search for "landing"
    const searchInput = screen.getByPlaceholderText("Search templates by name, tag, or category")
    await userEvent.type(searchInput, "landing")

    // Should show landing page templates
    await waitFor(() => {
      expect(screen.getByText("Landing Page / SaaS")).toBeInTheDocument()
    })

    // Should not show CV template
    expect(screen.queryByText("Personal CV / Resume")).not.toBeInTheDocument()
  })

  it("switches between all three tabs", async () => {
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

    // Switch to Templates tab
    await userEvent.click(screen.getByTestId("templates-tab-trigger"))
    expect(screen.getByText("Template catalog")).toBeInTheDocument()
    // The tab button still exists but the tab content should not show "Data Sources" content
    expect(screen.queryByText("Search data sources")).not.toBeInTheDocument()

    // Switch back to settings tab
    await userEvent.click(screen.getByTestId("settings-tab-trigger"))
    expect(screen.getByLabelText("Content")).toBeInTheDocument()
  })
})
