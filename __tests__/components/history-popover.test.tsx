import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { HistoryPopover } from "@/client/features/page-builder/history-popover"
import type { HistoryEntry } from "@/client/features/types"

const makeEntry = (action: string, secondsAgo: number): HistoryEntry => ({
  action,
  timestamp: new Date(Date.now() - secondsAgo * 1000),
  componentTree: [],
})

describe("HistoryPopover", () => {
  it("shows one row per history entry with action and time", () => {
    const history = [makeEntry("Add text", 30), makeEntry("Change color", 10)]
    render(
      <HistoryPopover
        isOpen
        onOpenChange={jest.fn()}
        history={history}
        currentHistoryIndex={1}
        onSelectHistory={jest.fn()}
        onAccept={jest.fn()}
        onDiscard={jest.fn()}
        previewIndex={null}
      >
        <button>History</button>
      </HistoryPopover>
    )

    expect(screen.getByText("Add text")).toBeInTheDocument()
    expect(screen.getByText("Change color")).toBeInTheDocument()
    expect(screen.getAllByText("now").length).toBe(2)
  })

  it("selecting an entry previews it; Discard returns; Accept commits", async () => {
    const user = userEvent.setup()
    const onSelectHistory = jest.fn()
    const onAccept = jest.fn()
    const onDiscard = jest.fn()
    const history = [makeEntry("Add text", 30)]

    render(
      <HistoryPopover
        isOpen
        onOpenChange={jest.fn()}
        history={history}
        currentHistoryIndex={0}
        onSelectHistory={onSelectHistory}
        onAccept={onAccept}
        onDiscard={onDiscard}
        previewIndex={null}
      >
        <button>History</button>
      </HistoryPopover>
    )

    await user.click(screen.getByText("Add text"))
    expect(onSelectHistory).toHaveBeenCalledWith(0)

    await user.click(screen.getByRole("button", { name: /Discard/i }))
    expect(onDiscard).toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: /Accept/i }))
    expect(onAccept).toHaveBeenCalled()
  })
})
