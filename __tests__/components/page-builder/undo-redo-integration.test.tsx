import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Toolbar } from "@/client/features/page-builder/toolbar"
import type { AppNode, PageBuilderMode, HistoryEntry } from "@/client/features/types"

const componentTree: ReadonlyArray<AppNode> = [
  { tag: "page", attributes: { id: "page-1", title: "Test Page" }, children: [] },
]

const historyWithTwoEntries: ReadonlyArray<HistoryEntry> = [
  { id: "h0", action: "Page created", timestamp: new Date(), pageState: componentTree },
  { id: "h1", action: "Inserted header1", timestamp: new Date(), pageState: [...componentTree, { tag: "header1", attributes: { id: "header-1" }, children: [] }] },
  { id: "h2", action: "Updated header-1", timestamp: new Date(), pageState: [...componentTree, { tag: "header1", attributes: { id: "header-1" }, children: ["Hello"] }] },
]

describe("Toolbar undo/redo integration", () => {
  const baseProps = {
    toolbarMinimized: false,
    setToolbarMinimized: jest.fn(),
    savePage: jest.fn(),
    handleDiscard: jest.fn(),
    pageBuilderMode: "edit" as PageBuilderMode,
    history: [] as ReadonlyArray<HistoryEntry>,
    currentHistoryIndex: -1,
    onSelectHistory: jest.fn(),
    onAcceptHistory: jest.fn(),
    onDiscardHistory: jest.fn(),
    historyPreviewIndex: null,
    onOpenCommandPalette: jest.fn(),
    onOpenAIAssistant: jest.fn(),
    onUndo: jest.fn(),
    onRedo: jest.fn(),
    onDuplicatePage: jest.fn(),
    componentTree,
    promptAssistEnabled: true,
  }

  it("enables Undo after two history entries", () => {
    render(<Toolbar {...baseProps} history={historyWithTwoEntries} currentHistoryIndex={2} />)

    expect(screen.getByRole("button", { name: "Undo" })).not.toBeDisabled()
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled()
  })

  it("enables Redo after undo", () => {
    render(<Toolbar {...baseProps} history={historyWithTwoEntries} currentHistoryIndex={1} />)

    expect(screen.getByRole("button", { name: "Undo" })).not.toBeDisabled()
    expect(screen.getByRole("button", { name: "Redo" })).not.toBeDisabled()
  })

  it("disables Undo at beginning of history", () => {
    render(<Toolbar {...baseProps} history={historyWithTwoEntries} currentHistoryIndex={0} />)

    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Redo" })).not.toBeDisabled()
  })

  it("calls onUndo when Undo button is clicked", async () => {
    const onUndo = jest.fn()
    const { container } = render(<Toolbar {...baseProps} history={historyWithTwoEntries} currentHistoryIndex={2} onUndo={onUndo} />)

    const undoButton = screen.getByRole("button", { name: "Undo" })
    console.log("Button disabled:", undoButton.disabled)
    console.log("Button onClick:", undoButton.onclick)
    console.log("Button props:", undoButton)

    await userEvent.click(undoButton)

    expect(onUndo).toHaveBeenCalledTimes(1)
  })

  it("calls onRedo when Redo button is clicked", async () => {
    const onRedo = jest.fn()
    const { container } = render(<Toolbar {...baseProps} history={historyWithTwoEntries} currentHistoryIndex={1} onRedo={onRedo} />)

    const redoButton = screen.getByRole("button", { name: "Redo" })
    console.log("Redo Button disabled:", redoButton.disabled)
    console.log("Redo Button onClick:", redoButton.onclick)

    await userEvent.click(redoButton)

    expect(onRedo).toHaveBeenCalledTimes(1)
  })
})
