import { render, screen } from "@testing-library/react"
import { Toolbar } from "@/client/features/page-builder/toolbar"
import type { AppNode, PageBuilderMode } from "@/client/features/types"
import type { HistoryEntry } from "@/client/features/types"

const componentTree: ReadonlyArray<AppNode> = [
  { tag: "page", attributes: { id: "page-1" }, children: [] },
]

const historyWithEntries: ReadonlyArray<HistoryEntry> = [
  { id: "h0", action: "Inserted header1", timestamp: new Date(), pageState: componentTree },
  { id: "h1", action: "Updated header-1", timestamp: new Date(), pageState: componentTree },
]

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

const renderedTitles = () =>
  screen.getAllByRole("button").map((button) => button.getAttribute("title") ?? "")

describe("Toolbar button layout", () => {
  it("renders no duplicate buttons when expanded", () => {
    render(<Toolbar {...baseProps} />)

    const titles = renderedTitles()

    expect(titles.length).toBeGreaterThan(0)
    expect(new Set(titles).size).toBe(titles.length)
  })

  it("keeps L - R within -1, 0, or 1 when expanded", () => {
    render(<Toolbar {...baseProps} />)

    const titles = renderedTitles()
    const pivotIndex = titles.indexOf("Minimize")

    expect(pivotIndex).toBeGreaterThanOrEqual(0)
    const left = pivotIndex
    const right = titles.length - pivotIndex - 1

    expect([-1, 0, 1]).toContain(left - right)
  })

  it("renders only the maximize button when minimized", () => {
    render(<Toolbar {...baseProps} toolbarMinimized />)

    expect(renderedTitles()).toEqual(["Maximize"])
  })

  it("keeps L - R within -1, 0, or 1 when the AI assistant button is hidden", () => {
    render(<Toolbar {...baseProps} promptAssistEnabled={false} />)

    const titles = renderedTitles()
    const pivotIndex = titles.indexOf("Minimize")

    expect(pivotIndex).toBeGreaterThanOrEqual(0)
    const left = pivotIndex
    const right = titles.length - pivotIndex - 1

    expect([-1, 0, 1]).toContain(left - right)
  })
})

describe("Toolbar undo/redo button state", () => {
  it("disables Undo and Redo when history is empty", () => {
    render(<Toolbar {...baseProps} />)

    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled()
  })

  it("enables Undo when there are previous history entries", () => {
    render(
      <Toolbar
        {...baseProps}
        history={historyWithEntries}
        currentHistoryIndex={1}
      />,
    )

    expect(screen.getByRole("button", { name: "Undo" })).not.toBeDisabled()
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled()
  })

  it("enables Redo after undo when not at latest history", () => {
    render(
      <Toolbar
        {...baseProps}
        history={historyWithEntries}
        currentHistoryIndex={0}
      />,
    )

    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Redo" })).not.toBeDisabled()
  })

  it("enables both Undo and Redo when in middle of history", () => {
    const threeEntryHistory: ReadonlyArray<HistoryEntry> = [
      ...historyWithEntries,
      { id: "h2", action: "Inserted div", timestamp: new Date(), pageState: componentTree },
    ]

    render(
      <Toolbar
        {...baseProps}
        history={threeEntryHistory}
        currentHistoryIndex={1}
      />,
    )

    expect(screen.getByRole("button", { name: "Undo" })).not.toBeDisabled()
    expect(screen.getByRole("button", { name: "Redo" })).not.toBeDisabled()
  })
})
