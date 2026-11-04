import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ToolbarSettingsPopover } from "@/client/features/page-builder/toolbar-settings-popover"
import { Button } from "@/client/components/ui/button"

const mockOnBrowseTemplates = jest.fn()
const mockOnOpenChange = jest.fn()

describe("ToolbarSettingsPopover Browse Templates", () => {
  it("calls onBrowseTemplates when the button is clicked", async () => {
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
        onBrowseTemplates={mockOnBrowseTemplates}
      >
        <Button>Settings</Button>
      </ToolbarSettingsPopover>
    )

    const button = screen.getByText("Browse Templates")
    await userEvent.click(button)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    expect(mockOnBrowseTemplates).toHaveBeenCalled()
  })
})
