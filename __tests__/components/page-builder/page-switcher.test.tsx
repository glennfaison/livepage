import { render, screen, fireEvent } from "@testing-library/react"
import { Toolbar } from "@/client/features/page-builder/toolbar"
import type { AppNode, PageBuilderMode, AppAction } from "@/client/features/types"

const pages: ReadonlyArray<AppNode> = [
  { tag: "page", attributes: { id: "page-1", title: "Home" }, children: [] },
  { tag: "page", attributes: { id: "page-2", title: "About" }, children: [] },
  { tag: "page", attributes: { id: "page-3" }, children: [] },
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
  componentTree: pages,
  pageComponent: pages[0],
  promptAssistEnabled: false,
}

describe("Page switcher", () => {
  it("lists pages by title (or id) and marks the active one", () => {
    render(<Toolbar {...baseProps} />)

    const switcher = screen.getByTestId("page-switcher")
    expect(switcher).toHaveAccessibleName("Switch page")
    expect(switcher).toHaveTextContent("Home")
  })

  it("dispatches SET_ACTIVE_PAGE when a different page is chosen", () => {
    const dispatch = jest.fn()
    render(<Toolbar {...baseProps} dispatch={dispatch} />)

    fireEvent.click(screen.getByTestId("page-switcher"))
    fireEvent.click(screen.getByText("About"))

    expect(dispatch).toHaveBeenCalledWith({ type: "SET_ACTIVE_PAGE", payload: "page-2" })
  })

  it("updates the label when the active page title changes", () => {
    const { rerender } = render(<Toolbar {...baseProps} />)
    expect(screen.getByTestId("page-switcher")).toHaveTextContent("Home")

    const updated = [
      { ...pages[0], attributes: { ...pages[0].attributes, title: "Homepage" } },
      ...pages.slice(1),
    ]
    rerender(<Toolbar {...baseProps} componentTree={updated} pageComponent={updated[0]} />)

    expect(screen.getByTestId("page-switcher")).toHaveTextContent("Homepage")
  })
})
