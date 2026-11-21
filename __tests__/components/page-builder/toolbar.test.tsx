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
    // Drag handles are pointer-only and aria-hidden; they are not buttons
    // and carry no title; per ADR 0005 they never count here.
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
  it("does not expose drag handles as focusable buttons", () => {
    render(<Toolbar {...baseProps} />)

    expect(screen.queryAllByRole("button", { name: "Drag toolbar" })).toHaveLength(0)
    const grips = document.querySelectorAll('[aria-hidden="true"]')
    expect(grips.length).toBeGreaterThanOrEqual(2)
  })
})

describe("Toolbar button accessible names", () => {
  it("gives every button an accessible name", () => {
    const original = process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED
    process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED = "1"
    try {
      render(<Toolbar {...baseProps} />)

      const expected = [
      "Open AI Assistant",
      "History",
      "Undo",
      "Redo",
      "Minimize",
      "Save",
      "Discard",
      "Settings",
      "Switch to horizontal layout",
    ]
    for (const name of expected) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument()
    }
    } finally {
      if (original === undefined) delete process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED
      else process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED = original
    }
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
    const originalEnv = process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED
    process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED = "1"
    try {
      render(<Toolbar {...baseProps} promptAssistEnabled={promptAssistEnabled} />)

      const titles = renderedTitles()
      const pivotIndex = titles.findIndex((title) => title.startsWith("Minimize"))

      expect(pivotIndex).toBe(left)
      expect(titles.length - pivotIndex - 1).toBe(right)
    } finally {
      if (originalEnv === undefined) delete process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED
      else process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED = originalEnv
    }
  })
})

describe("Toolbar screen reader announcements", () => {
  it("announces 'Toolbar minimized' when the minimize button is clicked", () => {
    render(<Toolbar {...baseProps} />)

    fireEvent.click(screen.getByTitle(/Minimize/))

    expect(screen.getByRole("status")).toHaveTextContent("Toolbar minimized")
  })

  it("announces 'Toolbar restored' when the maximize button is clicked", () => {
    render(<Toolbar {...baseProps} toolbarMinimized />)

    fireEvent.click(screen.getByTitle(/Maximize/))

    expect(screen.getByRole("status")).toHaveTextContent("Toolbar restored")
  })
})

describe("Toolbar AI Assistant gated by deployment flag", () => {
  const original = process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED
    else process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED = original
  })

  it("hides the AI Assistant toolbar button when the deployment flag is off even if promptAssistEnabled is true", () => {
    process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED = "0"
    render(<Toolbar {...baseProps} promptAssistEnabled={true} onOpenAIAssistant={jest.fn()} />)

    expect(screen.queryByTitle("Open AI Assistant")).not.toBeInTheDocument()
  })

  it("shows the AI Assistant toolbar button when the deployment flag is on and promptAssistEnabled is true", () => {
    process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED = "1"
    render(<Toolbar {...baseProps} promptAssistEnabled={true} onOpenAIAssistant={jest.fn()} />)

    expect(screen.getByTitle("Open AI Assistant")).toBeInTheDocument()
  })
})

describe("Toolbar in preview mode", () => {
  it("renders nothing when pageBuilderMode is preview", () => {
    const { container } = render(
      <Toolbar {...baseProps} pageBuilderMode={"preview" as PageBuilderMode} />,
    )
    expect(container.firstChild).toBeNull()
  })
})

describe("Toolbar mobile wrap and clamp", () => {
  it("uses flex-wrap on the expanded button row so controls can wrap on narrow viewports", () => {
    const { container } = render(<Toolbar {...baseProps} />)
    const row = container.querySelector(".flex.flex-wrap, .flex-wrap")
    // The expanded layout row must allow wrapping (horizontal or vertical).
    expect(row).not.toBeNull()
    expect(row?.className).toMatch(/flex-wrap/)
  })
})
