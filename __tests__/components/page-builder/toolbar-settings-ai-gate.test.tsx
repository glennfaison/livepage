import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ToolbarSettingsPopover } from "@/client/features/page-builder/toolbar-settings-popover"
import { Button } from "@/client/components/ui/button"
import type { AppNode } from "@/client/features/types"

const pageComponent: AppNode = {
  tag: "page",
  attributes: { id: "page-1", title: "Home" },
  children: [],
}

const baseProps = {
  isOpen: true,
  onOpenChange: jest.fn(),
  toolbarLayout: "horizontal" as const,
  onToolbarLayoutChange: jest.fn(),
  pageTitle: "Home",
  onPageTitleChange: jest.fn(),
  pageComponent,
  componentTree: [pageComponent],
  dispatch: jest.fn(),
  promptAssistEnabled: false,
  children: <Button data-testid="settings-trigger">Settings</Button>,
}

describe("ToolbarSettingsPopover AI Assistant gate", () => {
  const original = process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED
    else process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED = original
  })

  it("does not offer Enable AI Assistant when the deployment flag is off", async () => {
    process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED = "0"
    render(<ToolbarSettingsPopover {...baseProps} />)

    await userEvent.click(screen.getByTestId("settings-trigger"))

    expect(screen.queryByText("Enable AI Assistant")).not.toBeInTheDocument()
    expect(screen.queryByText("AI Assistant")).not.toBeInTheDocument()
  })

  it("offers Enable AI Assistant when the deployment flag is on", async () => {
    process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED = "1"
    render(<ToolbarSettingsPopover {...baseProps} />)

    await userEvent.click(screen.getByTestId("settings-trigger"))

    expect(screen.getByText("Enable AI Assistant")).toBeInTheDocument()
  })
})
