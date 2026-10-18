import { render } from "@testing-library/react"
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

const STORAGE_KEY = "livepage-toolbar"

function setStored(position: { x: number; y: number }, layout: "horizontal" | "vertical") {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 1, position, layout }),
  )
}

function clearStorage() {
  window.localStorage.removeItem(STORAGE_KEY)
}

const toolbarStyle = () => {
  const el = Array.from(document.querySelectorAll("div[style]")).find((e) =>
    e.getAttribute("style")?.includes("transform"),
  )
  return el as HTMLElement | null
}

describe("Toolbar persistence", () => {
  afterEach(() => {
    clearStorage()
  })

  it("restores the stored position on mount", () => {
    setStored({ x: 400, y: 300 }, "vertical")

    render(<Toolbar {...baseProps} />)

    const style = toolbarStyle()?.getAttribute("style")
    expect(style).toContain("left: 400px")
    expect(style).toContain("top: 300px")
  })

  it("restores the stored layout on mount", () => {
    setStored({ x: 100, y: 100 }, "horizontal")

    render(<Toolbar {...baseProps} />)

    const inner = toolbarStyle()?.firstElementChild
    expect(inner?.className).toContain("flex-row")
  })

  it("falls back to defaults when nothing is stored", () => {
    clearStorage()

    render(<Toolbar {...baseProps} />)

    expect(toolbarStyle()).not.toBeNull()
  })

  it("clamps a stored position that falls outside the viewport", () => {
    setStored({ x: 9999, y: 9999 }, "vertical")

    render(<Toolbar {...baseProps} />)

    const style = toolbarStyle()?.getAttribute("style")
    expect(style).not.toContain("left: 9999px")
    expect(style).not.toContain("top: 9999px")
  })
})
