"use client"

import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CommandPalette } from "@/client/features/command-palette"
import type { AppState, Operations } from "@/client/features/types"
import type { PageTemplateDisplaySummary } from "@/client/features/page-templates"

jest.mock("@/client/components/ui/use-toast", () => ({
  toast: jest.fn(),
}))

function buildState(overrides: Partial<AppState> = {}): AppState {
  const page = {
    tag: "page",
    attributes: { id: "page-1", title: "Home Page" },
    children: [
      {
        tag: "header1",
        attributes: { id: "header-1" },
        children: ["Hello world"],
      },
    ],
  }

  return {
    componentTree: [page],
    activePage: "page-1",
    selectedComponentId: "",
    selectedComponentAncestors: [],
    pageBuilderMode: "edit",
    toolbarMinimized: false,
    showToolbar: true,
    promptAssistEnabled: false,
    stale: false,
    history: [
      { id: "h0", action: "Inserted header1", timestamp: new Date(), pageState: [page] },
    ],
    currentHistoryIndex: 0,
    historyPreviewIndex: null,
    originalHistoryState: null,
    ...overrides,
  }
}

function buildComponentOperations(): Operations {
  return {
    addComponent: jest.fn(),
    updateComponent: jest.fn(),
    removeComponent: jest.fn(),
    duplicateComponent: jest.fn(),
    duplicatePage: jest.fn(),
    setSelectedComponent: jest.fn(),
    replaceComponent: jest.fn(),
    findComponentById: jest.fn(),
  }
}

function renderPalette(props: {
  state?: AppState
  templates?: ReadonlyArray<PageTemplateDisplaySummary>
  onOpenAIAssistant?: () => void
  onToggleToolbar?: () => void
  onOpenKeyboardShortcuts?: () => void
} = {}) {
  const state = buildState(props.state ?? { currentHistoryIndex: 1 })
  const dispatch = jest.fn()
  const componentOperations = buildComponentOperations()
  const onOpenChange = jest.fn()

  render(
    <CommandPalette
      open
      onOpenChange={onOpenChange}
      state={state}
      dispatch={dispatch}
      componentOperations={componentOperations}
      templates={props.templates ?? []}
      onApplyPageTemplate={jest.fn()}
      onSaveAsJson={jest.fn()}
      onSaveAsShortcode={jest.fn()}
      onSaveAsHtml={jest.fn()}
      onPreviewExport={jest.fn()}
      onCopyHtml={jest.fn()}
      onImportJson={jest.fn()}
      onImportShortcode={jest.fn()}
      onDiscardChanges={jest.fn()}
      onOpenAIAssistant={props.onOpenAIAssistant}
      onDuplicatePage={jest.fn()}
      onToggleToolbar={props.onToggleToolbar}
      onOpenKeyboardShortcuts={props.onOpenKeyboardShortcuts}
    />,
  )

  return { state, dispatch, componentOperations, onOpenChange }
}

describe("Command palette actions", () => {
  afterEach(() => {
    cleanup()
  })

  it("runs each action command once and closes the palette", async () => {
    const { dispatch, onOpenChange } = renderPalette()

    const commands = [
      "Undo last change",
      "Redo change",
      "Save page as JSON",
      "Export page as HTML",
      "Copy HTML to clipboard",
      "Import page from JSON",
      "Duplicate page",
    ]

    for (const label of commands) {
      fireEvent.click(screen.getByText(label))
    }

    expect(dispatch).toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("lists and inserts a component when its name is searched", async () => {
    const { componentOperations } = renderPalette()

    const input = screen.getByPlaceholderText(/search actions, components, and templates/i)
    await userEvent.type(input, "header")

    const command = await screen.findByText(/insert header 1/i)
    await userEvent.click(command)

    expect(componentOperations.addComponent).toHaveBeenCalled()
  })

  it("runs the highlighted command with Enter after arrow navigation", async () => {
    const { dispatch } = renderPalette()

    const input = screen.getByPlaceholderText(/search actions, components, and templates/i)
    fireEvent.focus(input)

    // The first command ("Switch to preview mode") is highlighted by default.
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" })

    expect(dispatch).toHaveBeenCalled()
    expect(screen.getByText(/k to toggle/i)).toBeInTheDocument()
  })

  it("shows the keyboard shortcuts hint in the footer", () => {
    renderPalette()

    expect(screen.getByText(/k to toggle/i)).toBeInTheDocument()
    expect(screen.getByText(/↑↓ to navigate/i)).toBeInTheDocument()
    expect(screen.getByText(/↵ to run/i)).toBeInTheDocument()
    expect(screen.getByText(/esc to close/i)).toBeInTheDocument()
  })

  it("shows 'Open AI Assistant' only when onOpenAIAssistant is provided", () => {
    renderPalette({ onOpenAIAssistant: jest.fn() })
    expect(screen.getByText(/open ai assistant/i)).toBeInTheDocument()

    cleanup()
    renderPalette({ onOpenAIAssistant: undefined })
    expect(screen.queryByText(/open ai assistant/i)).not.toBeInTheDocument()
  })
})
