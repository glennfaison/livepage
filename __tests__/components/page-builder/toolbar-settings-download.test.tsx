import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ToolbarSettingsPopover } from "@/client/features/page-builder/toolbar-settings-popover"
import { Button } from "@/client/components/ui/button"

const mockOnDownloadHtml = jest.fn()
const mockOnOpenChange = jest.fn()

describe("ToolbarSettingsPopover Download as HTML", () => {
  it("runs validation and calls onDownloadHtml when the button is clicked (no issues)", async () => {
    render(
      <ToolbarSettingsPopover
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        toolbarLayout="horizontal"
        onToolbarLayoutChange={() => {}}
        pageTitle="Test"
        onPageTitleChange={() => {}}
        pageComponent={{ tag: "page", attributes: { id: "p1" }, children: [] }}
        componentTree={[]}
        dispatch={() => {}}
        promptAssistEnabled={false}
        onDownloadHtml={mockOnDownloadHtml}
      >
        <Button>Settings</Button>
      </ToolbarSettingsPopover>
    )

    const button = screen.getByText("Download as HTML")
    await userEvent.click(button)

    expect(mockOnDownloadHtml).toHaveBeenCalled()
  })
})
