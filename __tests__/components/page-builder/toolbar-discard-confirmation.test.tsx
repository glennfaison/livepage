import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Toolbar } from "@/client/features/page-builder/toolbar"
import type { AppNode, HistoryEntry, PageBuilderMode } from "@/client/features/types"

const componentTree: ReadonlyArray<AppNode> = [
  { tag: "page", attributes: { id: "page-1" }, children: [] },
]

const history: ReadonlyArray<HistoryEntry> = [
  { id: "h0", action: "Page created", timestamp: new Date(0), pageState: componentTree },
  { id: "h1", action: "Inserted component", timestamp: new Date(1), pageState: componentTree },
]

const baseProps = {
  toolbarMinimized: false,
  setToolbarMinimized: jest.fn(),
  savePage: jest.fn(),
  handleDiscard: jest.fn(),
  pageBuilderMode: "edit" as PageBuilderMode,
  history,
  currentHistoryIndex: 1,
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

const renderedDiscardDialog = () => within(screen.getByRole("dialog"))

describe("Toolbar discard confirmation", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("asks before discarding and only discards once the dialog is confirmed", async () => {
    const user = userEvent.setup()
    const dispatch = jest.fn()
    render(<Toolbar {...baseProps} dispatch={dispatch} />)

    await user.click(screen.getByRole("button", { name: "Discard" }))

    const dialog = renderedDiscardDialog()
    expect(dialog.getByText("Discard all changes?")).toBeInTheDocument()
    expect(dispatch).not.toHaveBeenCalled()

    await user.click(dialog.getByRole("button", { name: "Discard" }))

    expect(dispatch).toHaveBeenCalledWith({ type: "DISCARD_CHANGES" })
  })

  it("keeps the page when the confirmation is cancelled", async () => {
    const user = userEvent.setup()
    const dispatch = jest.fn()
    render(<Toolbar {...baseProps} dispatch={dispatch} />)

    await user.click(screen.getByRole("button", { name: "Discard" }))
    await user.click(renderedDiscardDialog().getByRole("button", { name: "Cancel" }))

    expect(dispatch).not.toHaveBeenCalled()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("discards straight away when the user has opted out of the confirmation", async () => {
    const user = userEvent.setup()
    window.localStorage.setItem("livepage-discard-confirmation", "false")
    const dispatch = jest.fn()
    render(<Toolbar {...baseProps} dispatch={dispatch} />)

    await user.click(screen.getByRole("button", { name: "Discard" }))

    expect(dispatch).toHaveBeenCalledWith({ type: "DISCARD_CHANGES" })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("discards immediately and toasts when there is nothing to discard", async () => {
    const user = userEvent.setup()
    const dispatch = jest.fn()
    render(<Toolbar {...baseProps} history={[]} currentHistoryIndex={-1} dispatch={dispatch} />)

    await user.click(screen.getByRole("button", { name: "Discard" }))

    expect(dispatch).toHaveBeenCalledWith({ type: "DISCARD_CHANGES" })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})
