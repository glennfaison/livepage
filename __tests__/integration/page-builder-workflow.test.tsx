import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import BuilderPage from "@/app/try/page"
// Do not import jest; it is available globally in the Jest environment

// Mock the hooks
jest.mock("@/lib/store/hooks", () => {
  const originalModule = jest.requireActual("@/lib/store/hooks")

  return {
    ...originalModule,
    useAppState: jest.fn(() => ({
      state: {
        pages: [
          {
            title: "Test Page",
            attributes: { id: "page-1", },
            components: [],
          },
        ],
        activePage: "page-1",
        selectedComponentId: null,
        pageBuilderMode: false,
        toolbarMinimized: false,
        showToolbar: true,
        history: [
          {
            id: "history-1",
            action: "Page created",
            timestamp: new Date(),
            pageState: [
              {
                title: "Test Page",
                attributes: { id: "page-1", },
                components: [],
              },
            ],
          },
        ],
        currentHistoryIndex: 0,
        historyPreviewIndex: null,
        originalHistoryState: null,
      },
      dispatch: jest.fn(),
    })),
    usePageOperations: jest.fn(() => ({
      savePageAsShortcodeMutation: { mutate: jest.fn(), isPending: false },
      savePageAsJsonMutation: { mutate: jest.fn(), isPending: false },
      loadPageMutation: { mutate: jest.fn(), isPending: false },
      savePageAsHtmlMutation: { mutate: jest.fn(), isPending: false },
    })),
    useComponentOperations: jest.fn(() => ({
      addComponent: jest.fn(),
      updateComponent: jest.fn(),
      removeComponent: jest.fn(),
      duplicateComponent: jest.fn(),
      replaceComponent: jest.fn(),
      findComponentById: jest.fn(),
    })),
    useHistoryOperations: jest.fn(() => ({
      handleSelectHistory: jest.fn(),
      handleHistoryAccept: jest.fn(),
      handleHistoryDiscard: jest.fn(),
      handleDiscard: jest.fn(),
    })),
  }
})

// Mock the page-builder components
jest.mock("@/components/page-builder/page-builder", () => ({
  renderDesignComponent: jest.fn(() => <div data-testid="mock-component">Mock Component</div>),
}))

jest.mock("@/components/page-builder/toolbar", () => ({
  Toolbar: jest.fn(() => <div data-testid="mock-toolbar">Mock Toolbar</div>),
}))

describe("BuilderPage Integration", () => {
  it("renders the builder page with all components", async () => {
    render(<BuilderPage />)

    // Check for main UI elements
    expect(screen.getByText("LivePage")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /switch to preview mode/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Page Title")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /load/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument()
    expect(screen.getByTestId("mock-toolbar")).toBeInTheDocument()
  })

  it("toggles preview mode when Edit Mode button is clicked", async () => {
    const { useAppState } = jest.requireMock("@/lib/store/hooks")
    const mockDispatch = jest.fn()
      ; (useAppState as jest.Mock).mockReturnValue({
        state: {
          pages: [{ title: "Test Page", attributes: { id: "page-1", }, components: [] }],
          activePage: "page-1",
          selectedComponentId: null,
          pageBuilderMode: false,
          toolbarMinimized: false,
          showToolbar: true,
          history: [],
          currentHistoryIndex: -1,
          historyPreviewIndex: null,
          originalHistoryState: null,
        },
        dispatch: mockDispatch,
      })

    render(<BuilderPage />)

    await userEvent.click(screen.getByRole("button", { name: /switch to preview mode/i }))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_PAGE_BUILDER_MODE",
      payload: "preview",
    })
  })

  it("updates page title when input changes", async () => {
    const { useAppState } = jest.requireMock("@/lib/store/hooks")
    const mockDispatch = jest.fn()
      ; (useAppState as jest.Mock).mockReturnValue({
        state: {
          pages: [{ title: "Test Page", attributes: { id: "page-1", }, components: [] }],
          activePage: "page-1",
          selectedComponentId: null,
          pageBuilderMode: false,
          toolbarMinimized: false,
          showToolbar: true,
          history: [],
          currentHistoryIndex: -1,
          historyPreviewIndex: null,
          originalHistoryState: null,
        },
        dispatch: mockDispatch,
      })

    render(<BuilderPage />)

    const titleInput = screen.getByPlaceholderText("Page Title")
    await userEvent.clear(titleInput)
    expect(titleInput).toHaveValue('')
    await userEvent.type(titleInput, "New Page Title")

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "UPDATE_PAGE",
      payload: { id: "page-1", updates: { title: "New Page Title" } },
    })
  })

  it("opens save dropdown when Save button is clicked", async () => {
    render(<BuilderPage />)

    const saveButton = screen.getByRole("button", { name: /save/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText("Download as JSON")).toBeInTheDocument()
      expect(screen.getByText("Download as HTML")).toBeInTheDocument()
    })
  })

  it("triggers save as JSON when Download as JSON is clicked", async () => {
    const { usePageOperations } = jest.requireMock("@/lib/store/hooks")
    const mockSavePageAsJsonMutation = { mutate: jest.fn(), isPending: false }
      ; (usePageOperations as jest.Mock).mockReturnValue({
        savePageAsShortcodeMutation: { mutate: jest.fn(), isPending: false },
        savePageAsJsonMutation: mockSavePageAsJsonMutation,
        loadPageMutation: { mutate: jest.fn(), isPending: false },
        savePageAsHtmlMutation: { mutate: jest.fn(), isPending: false },
      })

    render(<BuilderPage />)

    const saveButton = screen.getByRole("button", { name: /save/i })
    await userEvent.click(saveButton)

    const jsonOption = await screen.findByText("Download as JSON")
    await userEvent.click(jsonOption)

    expect(mockSavePageAsJsonMutation.mutate).toHaveBeenCalled()
  })

  it("triggers export as HTML when Download as HTML is clicked", async () => {
    const { usePageOperations } = jest.requireMock("@/lib/store/hooks")
    const mockSavePageAsHtmlMutation = { mutate: jest.fn(), isPending: false }
      ; (usePageOperations as jest.Mock).mockReturnValue({
        savePageAsShortcodeMutation: { mutate: jest.fn(), isPending: false },
        savePageAsJsonMutation: { mutate: jest.fn(), isPending: false },
        loadPageMutation: { mutate: jest.fn(), isPending: false },
        savePageAsHtmlMutation: mockSavePageAsHtmlMutation,
      })

    render(<BuilderPage />)

    const saveButton = screen.getByRole("button", { name: /save/i })
    await userEvent.click(saveButton)

    const htmlOption = await screen.findByText("Download as HTML")
    await userEvent.click(htmlOption)

    expect(mockSavePageAsHtmlMutation.mutate).toHaveBeenCalled()
  })

  it("adds a row component when Add Row button is clicked", async () => {
    const { useComponentOperations } = jest.requireMock("@/lib/store/hooks")
    const mockAddComponent = jest.fn()
      ; (useComponentOperations as jest.Mock).mockReturnValue({
        addComponent: mockAddComponent,
        updateComponent: jest.fn(),
        removeComponent: jest.fn(),
        duplicateComponent: jest.fn(),
        replaceComponent: jest.fn(),
        findComponentById: jest.fn(),
      })

    render(<BuilderPage />)

    const addRowButton = screen.getByRole("button", { name: /add row/i })
    await userEvent.click(addRowButton)

    expect(mockAddComponent).toHaveBeenCalledWith({
      type: "row",
      parentId: undefined,
      index: 0,
    })
  })
})
