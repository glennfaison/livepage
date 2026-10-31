import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ToolbarSettingsPopover } from "@/client/features/page-builder/toolbar-settings-popover"
import { Button } from "@/client/components/ui/button"
import type { AppNode } from "@/client/features/types"

const pageNode = {
  id: "page-1",
  tag: "page",
  attributes: { id: "page-1", title: "Header Title", description: "" },
  children: [],
} as unknown as AppNode

describe("ToolbarSettingsPopover field ids", () => {
  it("does not duplicate id=page-title and associates the Page Title label with the popover input", async () => {
    render(
      <>
        {/* Header title that previously collided */}
        <input id="page-title" defaultValue="Header Title" aria-label="Header page title" />
        <ToolbarSettingsPopover
          isOpen={true}
          onOpenChange={() => {}}
          toolbarLayout="horizontal"
          onToolbarLayoutChange={() => {}}
          pageTitle="Header Title"
          onPageTitleChange={() => {}}
          pageComponent={pageNode}
          componentTree={[pageNode]}
          dispatch={() => {}}
          promptAssistEnabled={false}
        >
          <Button>Settings</Button>
        </ToolbarSettingsPopover>
      </>,
    )

    // Only the header should have the literal id="page-title"
    const pageTitleIds = document.querySelectorAll("#page-title")
    expect(pageTitleIds).toHaveLength(1)
    expect(pageTitleIds[0]).toHaveAttribute("aria-label", "Header page title")

    // Popover label points at its own input
    const label = screen.getByText("Page Title")
    expect(label.tagName).toBe("LABEL")
    const htmlFor = label.getAttribute("for")
    expect(htmlFor).toBeTruthy()
    expect(htmlFor).not.toBe("page-title")

    const popoverInput = document.getElementById(htmlFor!)
    expect(popoverInput).toBeTruthy()
    expect(popoverInput).not.toHaveAttribute("id", "page-title")

    await userEvent.click(label)
    expect(document.activeElement).toBe(popoverInput)
  })
})
