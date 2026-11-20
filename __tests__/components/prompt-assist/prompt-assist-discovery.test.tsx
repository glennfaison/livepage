"use client"

import { render, screen, act, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CommandPalette } from "@/client/features/command-palette"
import { AssistChat } from "@/client/features/prompt-assist"
import type { AppState, Operations } from "@/client/features/types"

jest.mock("@/client/components/ui/use-toast", () => ({
  toast: jest.fn(),
}))

let mockQuery = "prompt-assist=1"
jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mockQuery),
}))

function buildComponentOperations(): Operations {
  return {
    addComponent: jest.fn(),
    updateComponent: jest.fn(),
    removeComponent: jest.fn(),
    duplicateComponent: jest.fn(),
    duplicatePage: jest.fn(),
    setSelectedComponent: jest.fn(),
    replaceComponent: jest.fn(),
    findComponentById: jest.fn(),
  }
}

function renderPalette(props: Partial<Parameters<typeof CommandPalette>[0]> = {}) {
  const defaultProps: Parameters<typeof CommandPalette>[0] = {
    open: true,
    onOpenChange: jest.fn(),
    state: {
      componentTree: [],
      activePage: "",
      selectedComponentId: "",
      selectedComponentAncestors: [],
      pageBuilderMode: "edit",
      toolbarMinimized: false,
      showToolbar: true,
      promptAssistEnabled: false,
      history: [],
      currentHistoryIndex: 0,
      historyPreviewIndex: null,
      originalHistoryState: null,
      stale: false,
    } as AppState,
    dispatch: jest.fn(),
    componentOperations: buildComponentOperations(),
    templates: [],
    onApplyPageTemplate: jest.fn(),
    onSaveAsJson: jest.fn(),
    onSaveAsShortcode: jest.fn(),
    onSaveAsHtml: jest.fn(),
    onPreviewExport: jest.fn(),
    onCopyHtml: jest.fn(),
    onImportJson: jest.fn(),
    onImportShortcode: jest.fn(),
    onDiscardChanges: jest.fn(),
    onOpenAIAssistant: jest.fn(),
    onDuplicatePage: jest.fn(),
    ...props,
  }

  render(<CommandPalette {...defaultProps} />)
  return { onOpenAIAssistant: defaultProps.onOpenAIAssistant, onOpenChange: defaultProps.onOpenChange }
}

describe("Prompt Assist discovery", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  describe("Open AI Assistant command", () => {
    it("does not render the 'Open AI Assistant' command when onOpenAIAssistant is not provided", () => {
      renderPalette({ onOpenAIAssistant: undefined })

      expect(screen.queryByText(/open ai assistant/i)).not.toBeInTheDocument()
    })

    it("renders the 'Open AI Assistant' command when onOpenAIAssistant is provided", () => {
      renderPalette()

      expect(screen.getByText(/open ai assistant/i)).toBeInTheDocument()
    })

    it("calls onOpenAIAssistant and closes the palette when the command is selected", async () => {
      const user = userEvent.setup()
      const { onOpenAIAssistant, onOpenChange } = renderPalette()

      await user.click(screen.getByText(/open ai assistant/i))

      expect(onOpenAIAssistant).toHaveBeenCalledTimes(1)
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe("AssistChat tooltip", () => {
    beforeEach(() => {
      jest.useFakeTimers()
      mockQuery = "prompt-assist=1"
      process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED = "1"
      window.localStorage.clear()
    })

    afterEach(() => {
      jest.useRealTimers()
      delete process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED
      window.localStorage.clear()
    })

    it("shows the first-visit tooltip when the chat has not been dismissed", async () => {
      render(<AssistChat dispatch={jest.fn()} />)

      await screen.findByRole("button", { name: /open page assistant/i })
      fireEvent.click(screen.getByRole("button", { name: /open page assistant/i }))
      await screen.findByRole("button", { name: /minimize page assistant/i })
      fireEvent.click(screen.getByRole("button", { name: /minimize page assistant/i }))

      act(() => {
        jest.advanceTimersByTime(1500)
      })

      expect(screen.getByText(/click to describe a page/i)).toBeInTheDocument()
    })

    it("does not show the tooltip after it has been dismissed", async () => {
      window.localStorage.setItem("prompt-assist-tooltip-dismissed", "true")

      render(<AssistChat dispatch={jest.fn()} />)

      await screen.findByRole("button", { name: /open page assistant/i })
      fireEvent.click(screen.getByRole("button", { name: /open page assistant/i }))
      await screen.findByRole("button", { name: /minimize page assistant/i })
      fireEvent.click(screen.getByRole("button", { name: /minimize page assistant/i }))

      act(() => {
        jest.advanceTimersByTime(1500)
      })

      expect(screen.queryByText(/click to describe a page/i)).not.toBeInTheDocument()
    })
  })
})
