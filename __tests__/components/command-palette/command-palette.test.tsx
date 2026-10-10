"use client"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@/client/features/design-components"
import { CommandPalette } from "@/client/features/command-palette"
import type { AppState, Operations } from "@/client/features/app-state"
import { describeTemplateDisplayCatalog } from "@/client/features/templates"
import { toast } from "@/client/components/ui/use-toast"

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
  } as any

  return {
    componentTree: [page],
    activePage: "page-1",
    selectedComponentId: "",
    selectedComponentAncestors: [],
    pageBuilderMode: "edit",
    toolbarMinimized: false,
    showToolbar: true,
    history: [
      { id: "h0", action: "Inserted header1", timestamp: new Date(), pageState: [page] },
      { id: "h1", action: "Updated header-1", timestamp: new Date(), pageState: [page] },
    ],
    currentHistoryIndex: 1,
    historyPreviewIndex: null,
    originalHistoryState: null,
    ...overrides,
  } as AppState
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
  } as unknown as Operations
}

function renderPalette(stateOverrides: Partial<AppState> = {}) {
  const state = buildState(stateOverrides)
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
      templates={[]}
      onApplyTemplate={jest.fn()}
      onSaveAsJson={jest.fn()}
      onSaveAsShortcode={jest.fn()}
      onSaveAsHtml={jest.fn()}
      onPreviewExport={jest.fn()}
      onCopyHtml={jest.fn()}
      onImportJson={jest.fn()}
      onImportShortcode={jest.fn()}
      onDiscardChanges={jest.fn()}
      onOpenAIAssistant={jest.fn()}
      onDuplicatePage={jest.fn()}
    />,
  )

  return { state, dispatch, componentOperations, onOpenChange }
}

describe("CommandPalette", () => {
  it("renders the search input and the Actions group", async () => {
    renderPalette()

    expect(screen.getByPlaceholderText(/search actions, components, and templates/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText("Undo last change")).toBeInTheDocument()
      expect(screen.getByText("Redo change")).toBeInTheDocument()
    })
  })

  it("filters commands by search term", async () => {
    renderPalette()

    const input = screen.getByPlaceholderText(/search actions, components, and templates/i)
    await userEvent.type(input, "undo last")

    await waitFor(() => {
      expect(screen.getByText("Undo last change")).toBeInTheDocument()
      expect(screen.queryByText("Redo change")).not.toBeInTheDocument()
    })
  })

  it("clears history-preview state when Undo is run, so a stale preview can't later discard it", async () => {
    const { dispatch, onOpenChange } = renderPalette()

    await userEvent.click(screen.getByText("Undo last change"))

    // The fix under test: SET_PAGES and SET_CURRENT_HISTORY_INDEX alone are
    // not enough — historyPreviewIndex/originalHistoryState (set by the
    // History popover's RESTORE_FROM_HISTORY) must also be cleared, or a
    // later "Discard" in that popover can silently revert this undo.
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "SET_PAGES" }))
    expect(dispatch).toHaveBeenCalledWith({ type: "SET_CURRENT_HISTORY_INDEX", payload: 0 })
    expect(dispatch).toHaveBeenCalledWith({ type: "SET_HISTORY_PREVIEW_INDEX", payload: null })
    expect(dispatch).toHaveBeenCalledWith({ type: "SET_ORIGINAL_HISTORY_STATE", payload: null })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("does not run Undo when there is nothing to undo", async () => {
    const { dispatch } = renderPalette({ currentHistoryIndex: 0 })

    await userEvent.click(screen.getByText("Undo last change"))

    expect(dispatch).not.toHaveBeenCalled()
  })

  it("selects a component when its jump-to-component entry is chosen", async () => {
    const { componentOperations } = renderPalette()

    const input = screen.getByPlaceholderText(/search actions, components, and templates/i)
    await userEvent.type(input, "Hello world")

    await waitFor(() => {
      expect(screen.getByText(/Header 1/)).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText(/Header 1/))

    expect(componentOperations.setSelectedComponent).toHaveBeenCalledWith("header-1")
  })

  it("filters and applies a template from display metadata by id", async () => {
    const onApplyTemplate = jest.fn()
    const templates = describeTemplateDisplayCatalog()
    render(
      <CommandPalette
        open
        onOpenChange={jest.fn()}
        state={buildState()}
        dispatch={jest.fn()}
        componentOperations={buildComponentOperations()}
        templates={templates}
        onApplyTemplate={onApplyTemplate}
        onSaveAsJson={jest.fn()}
        onSaveAsShortcode={jest.fn()}
        onSaveAsHtml={jest.fn()}
        onPreviewExport={jest.fn()}
        onCopyHtml={jest.fn()}
        onImportJson={jest.fn()}
        onImportShortcode={jest.fn()}
        onDiscardChanges={jest.fn()}
        onOpenAIAssistant={jest.fn()}
        onDuplicatePage={jest.fn()}
      />,
    )

    const search = screen.getByPlaceholderText(/search actions, components, and templates/i)
    await userEvent.type(search, "linkedin import")

    const command = await screen.findByRole("button", { name: /apply template: personal cv \/ resume/i })
    await userEvent.click(command)

    expect(onApplyTemplate).toHaveBeenCalledWith("cv-resume-personal-website")
    expect(toast).toHaveBeenCalledWith({ title: "Template applied", description: "Personal CV / Resume" })
  })

  it("asks before discarding all changes, and only discards once confirmed", async () => {
    window.localStorage.clear()
    const user = userEvent.setup()
    const { dispatch } = renderPalette()

    await user.click(screen.getByText("Discard all changes"))

    const dialog = within(screen.getByRole("dialog"))
    expect(dialog.getByText("Discard all changes?")).toBeInTheDocument()
    expect(dispatch).not.toHaveBeenCalled()

    await user.click(dialog.getByRole("button", { name: "Discard" }))

    expect(dispatch).toHaveBeenCalledWith({ type: "DISCARD_CHANGES" })
  })
  it("groups insert components by category and narrows them with the insert filter", async () => {
    renderPalette()

    // Insert commands are split into per-category groups (issue #210).
    await waitFor(() => {
      expect(screen.getByText("Insert component: Layout")).toBeInTheDocument()
      expect(screen.getByText("Insert component: Typography")).toBeInTheDocument()
      expect(screen.getByText("Insert component: Media")).toBeInTheDocument()
    })

    expect(screen.getByText("Insert Row")).toBeInTheDocument()
    expect(screen.getByText("Insert Header 1")).toBeInTheDocument()

    const layoutFilter = screen.getByRole("textbox", { name: "Filter Insert component: Layout components" })
    await userEvent.type(layoutFilter, "column")

    expect(screen.getByText("Insert Column")).toBeInTheDocument()
    expect(screen.queryByText("Insert Row")).not.toBeInTheDocument()
    // The insert filter is shared by every category group, so a Typography
    // group without a match collapses instead of keeping stale entries.
    expect(screen.queryByText("Insert component: Typography")).not.toBeInTheDocument()
    // Typography entries do not match either, so the whole group collapses.
    expect(screen.queryByText("Insert Header 1")).not.toBeInTheDocument()
    // Non-insert groups are untouched by the insert filter.
    expect(screen.getByText("Undo last change")).toBeInTheDocument()

    await userEvent.clear(layoutFilter)

    expect(screen.getByText("Insert Row")).toBeInTheDocument()
    expect(screen.getByText("Insert component: Typography")).toBeInTheDocument()
  })

  it("keeps the insert-component filter independent from the global search", async () => {
    renderPalette()

    await waitFor(() => {
      expect(screen.getByText("Insert component: Typography")).toBeInTheDocument()
    })

    const globalSearch = screen.getByPlaceholderText(/search actions, components, and templates/i)
    await userEvent.type(globalSearch, "header")

    // The global search still finds insert commands in their own groups.
    expect(screen.getByText("Insert Header 1")).toBeInTheDocument()
    expect(screen.queryByText("Undo last change")).not.toBeInTheDocument()
  })
})
