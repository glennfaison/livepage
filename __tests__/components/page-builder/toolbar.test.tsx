import { render, screen, fireEvent } from "@testing-library/react"
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
  onOpenAIAssistant: jest.fn(),
  onUndo: jest.fn(),
  onRedo: jest.fn(),
  onDuplicatePage: jest.fn(),
  componentTree,
  promptAssistEnabled: true,
}

const renderedTitles = () =>
  screen
    .getAllByRole("button")
    .map((button) => button.getAttribute("title") ?? "")
    // Drag handles (role="button", aria-label="Drag toolbar") are not action
    // buttons and carry no title; per ADR 0005 they never count here.
    .filter(Boolean)

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
    const pivotIndex = titles.findIndex((title) => title.startsWith("Minimize"))

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
    const pivotIndex = titles.findIndex((title) => title.startsWith("Minimize"))

    expect(pivotIndex).toBeGreaterThanOrEqual(0)
    const left = pivotIndex
    const right = titles.length - pivotIndex - 1

    expect([-1, 0, 1]).toContain(left - right)
  })
})

describe("Toolbar grip accessibility", () => {
  const gripLeft = (grip: HTMLElement) => {
    const toolbar = grip.closest("div[style]")
    const match = toolbar?.getAttribute("style")?.match(/left:\s*(\d+)px/)
    return match ? Number(match[1]) : null
  }

  it("exposes each grip handle as a keyboard-focusable button with an accessible name", () => {
    render(<Toolbar {...baseProps} />)

    const grips = screen.getAllByRole("button", { name: "Drag toolbar" })
    expect(grips.length).toBeGreaterThan(0)
    for (const grip of grips) {
      expect(grip.getAttribute("tabindex")).toBe("0")
      expect(grip.getAttribute("role")).toBe("button")
    }
  })

  it("picks up a grip on Enter, moves it with arrow keys, and drops it on Escape", () => {
    render(<Toolbar {...baseProps} />)

    const grips = screen.getAllByRole("button", { name: "Drag toolbar" })
    const grip = grips[0]

    const before = gripLeft(grip)
    expect(before).not.toBeNull()

    fireEvent.keyDown(grip, { key: "Enter" })
    fireEvent.keyDown(grip, { key: "ArrowRight" })

    const afterMove = gripLeft(grip)
    expect(afterMove).toBe(before! + 10)

    fireEvent.keyDown(grip, { key: "Escape" })
    fireEvent.keyDown(grip, { key: "ArrowRight" })

    const afterDrop = gripLeft(grip)
    expect(afterDrop).toBe(afterMove)
  })
})

describe("Toolbar without the command palette and duplicate page buttons", () => {
  it("does not render a command palette or a duplicate page button", () => {
    render(<Toolbar {...baseProps} />)

    expect(screen.queryByTitle("Command palette")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Duplicate page")).not.toBeInTheDocument()
    expect(renderedTitles().some((title) => title.startsWith("Duplicate page"))).toBe(false)
  })

  it("still duplicates the page with the keyboard shortcut", () => {
    const onDuplicatePage = jest.fn()
    render(<Toolbar {...baseProps} onDuplicatePage={onDuplicatePage} />)

    fireEvent.keyDown(window, { key: "d", ctrlKey: true, shiftKey: true })

    expect(onDuplicatePage).toHaveBeenCalledTimes(1)
  })

  it.each([
    [true, 4, 4],
    [false, 3, 4],
  ])("has the documented button counts when the page assistant is %s (left %i, right %i)", (promptAssistEnabled, left, right) => {
    render(<Toolbar {...baseProps} promptAssistEnabled={promptAssistEnabled} />)

    const titles = renderedTitles()
    const pivotIndex = titles.findIndex((title) => title.startsWith("Minimize"))

    expect(pivotIndex).toBe(left)
    expect(titles.length - pivotIndex - 1).toBe(right)
  })
})
