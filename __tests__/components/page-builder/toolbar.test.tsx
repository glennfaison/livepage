import { render, screen } from "@testing-library/react"
import { Toolbar } from "@/client/features/page-builder/toolbar"
import type { AppNode, PageBuilderMode } from "@/client/features/types"

const componentTree: ReadonlyArray<AppNode> = [
  { tag: "page", attributes: { id: "page-1" }, children: [] },
]

const baseProps = {
  toolbarMinimized: false,
  setToolbarMinimized: jest.fn(),
  savePage: jest.fn(),
  handleDiscard: jest.fn(),
  pageBuilderMode: "edit" as PageBuilderMode,
  history: [],
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
