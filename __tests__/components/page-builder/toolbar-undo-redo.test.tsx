import { render, screen } from "@testing-library/react"
import { Toolbar } from "@/client/features/page-builder/toolbar"
import type { AppNode, PageBuilderMode, HistoryEntry } from "@/client/features/types"

const componentTree: ReadonlyArray<AppNode> = [
  { tag: "page", attributes: { id: "page-1" }, children: [] },
]

const historyWithOneEntry: ReadonlyArray<HistoryEntry> = [
  {
    id: "history-1",
    action: "Page created",
    timestamp: new Date(),
    pageState: [{ tag: "page", attributes: { id: "page-1" }, children: [] }],
  },
]

const historyWithTwoEntries: ReadonlyArray<HistoryEntry> = [
  {
    id: "history-1",
    action: "Page created",
    timestamp: new Date(),
    pageState: [{ tag: "page", attributes: { id: "page-1" }, children: [] }],
  },
  {
    id: "history-2",
    action: "Inserted row",
    timestamp: new Date(),
    pageState: [
      {
        tag: "page",
        attributes: { id: "page-1" },
        children: [{ tag: "row", attributes: { id: "row-1" }, children: [] }],
      },
    ],
  },
]

const baseProps = {
  toolbarMinimized: false,
  setToolbarMinimized: jest.fn(),
  savePage: jest.fn(),
  handleDiscard: jest.fn(),
  pageBuilderMode: "edit" as PageBuilderMode,
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

describe("Toolbar undo/redo button states", () => {
  it("disables undo/redo when history is empty and index is -1", () => {
    render(<Toolbar {...baseProps} history={[]} currentHistoryIndex={-1} />)

    const undoButton = screen.getByRole("button", { name: /undo/i })
    const redoButton = screen.getByRole("button", { name: /redo/i })

    expect(undoButton).toBeDisabled()
    expect(redoButton).toBeDisabled()
  })

  it("disables undo/redo when history has one entry and index is 0", () => {
    render(<Toolbar {...baseProps} history={historyWithOneEntry} currentHistoryIndex={0} />)

    const undoButton = screen.getByRole("button", { name: /undo/i })
    const redoButton = screen.getByRole("button", { name: /redo/i })

    expect(undoButton).toBeDisabled()
    expect(redoButton).toBeDisabled()
  })

  it("enables undo when history has two entries and index is 1", () => {
    render(<Toolbar {...baseProps} history={historyWithTwoEntries} currentHistoryIndex={1} />)

    const undoButton = screen.getByRole("button", { name: /undo/i })
    const redoButton = screen.getByRole("button", { name: /redo/i })

    expect(undoButton).not.toBeDisabled()
    expect(redoButton).toBeDisabled()
  })

  it("enables redo when history has two entries and index is 0 after undo", () => {
    render(<Toolbar {...baseProps} history={historyWithTwoEntries} currentHistoryIndex={0} />)

    const undoButton = screen.getByRole("button", { name: /undo/i })
    const redoButton = screen.getByRole("button", { name: /redo/i })

    expect(undoButton).toBeDisabled()
    expect(redoButton).not.toBeDisabled()
  })
})