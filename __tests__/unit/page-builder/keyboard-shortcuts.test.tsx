import { render, fireEvent } from "@testing-library/react"
import {
  useSaveShortcut,
  useHistoryShortcut,
  useUndoShortcut,
  useRedoShortcut,
  useDuplicatePageShortcut,
} from "@/client/features/page-builder/keyboard-shortcuts"

interface ShortcutHarnessProps {
  onSave: () => void
  onHistory: () => void
  onUndo: () => void
  onRedo: () => void
  onDuplicate: () => void
  canUndo?: boolean
  canRedo?: boolean
}

function ShortcutHarness({
  onSave,
  onHistory,
  onUndo,
  onRedo,
  onDuplicate,
  canUndo = true,
  canRedo = true,
}: ShortcutHarnessProps) {
  useSaveShortcut(onSave)
  useHistoryShortcut(onHistory)
  useUndoShortcut(onUndo, canUndo)
  useRedoShortcut(onRedo, canRedo)
  useDuplicatePageShortcut(onDuplicate)
  return <div data-testid="harness" />
}

// Focuses the element and fires a keydown on it (the event bubbles up to the
// window listener, mirroring real typing where the editable element is the
// event target). Firing on `window` directly resets `document.activeElement` to
// `body` in jsdom, so the target must be the focused element.
function fireWhenFocused(element: HTMLElement, eventInit: KeyboardEventInit) {
  element.focus()
  fireEvent.keyDown(element, eventInit)
}

describe("keyboard shortcuts focus guard", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("fires save when the body (non-editable) is focused", () => {
    const onSave = jest.fn()
    render(
      <ShortcutHarness
        onSave={onSave}
        onHistory={jest.fn()}
        onUndo={jest.fn()}
        onRedo={jest.fn()}
        onDuplicate={jest.fn()}
      />,
    )

    fireEvent.keyDown(window, { key: "s", ctrlKey: true })

    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it("does not fire save when an input is focused", () => {
    const onSave = jest.fn()
    const input = document.createElement("input")
    render(
      <ShortcutHarness
        onSave={onSave}
        onHistory={jest.fn()}
        onUndo={jest.fn()}
        onRedo={jest.fn()}
        onDuplicate={jest.fn()}
      />,
    )

    fireWhenFocused(input, { key: "s", ctrlKey: true })

    expect(onSave).not.toHaveBeenCalled()
  })

  it("does not fire save when a textarea is focused", () => {
    const onSave = jest.fn()
    const textarea = document.createElement("textarea")
    render(
      <ShortcutHarness
        onSave={onSave}
        onHistory={jest.fn()}
        onUndo={jest.fn()}
        onRedo={jest.fn()}
        onDuplicate={jest.fn()}
      />,
    )

    fireWhenFocused(textarea, { key: "s", ctrlKey: true })

    expect(onSave).not.toHaveBeenCalled()
  })

  it("does not fire undo when a contentEditable element is focused", () => {
    const onUndo = jest.fn()
    const editable = document.createElement("div")
    editable.contentEditable = "true"
    render(
      <ShortcutHarness
        onSave={jest.fn()}
        onHistory={jest.fn()}
        onUndo={onUndo}
        onRedo={jest.fn()}
        onDuplicate={jest.fn()}
      />,
    )

    fireWhenFocused(editable, { key: "z", ctrlKey: true })

    expect(onUndo).not.toHaveBeenCalled()
  })

  it("does not fire undo when an input is focused", () => {
    const onUndo = jest.fn()
    const input = document.createElement("input")
    render(
      <ShortcutHarness
        onSave={jest.fn()}
        onHistory={jest.fn()}
        onUndo={onUndo}
        onRedo={jest.fn()}
        onDuplicate={jest.fn()}
      />,
    )

    fireWhenFocused(input, { key: "z", ctrlKey: true })

    expect(onUndo).not.toHaveBeenCalled()
  })

  it("still fires undo when the body is focused", () => {
    const onUndo = jest.fn()
    render(
      <ShortcutHarness
        onSave={jest.fn()}
        onHistory={jest.fn()}
        onUndo={onUndo}
        onRedo={jest.fn()}
        onDuplicate={jest.fn()}
      />,
    )

    fireEvent.keyDown(window, { key: "z", ctrlKey: true })

    expect(onUndo).toHaveBeenCalledTimes(1)
  })

  it("does not fire redo when an input is focused", () => {
    const onRedo = jest.fn()
    const input = document.createElement("input")
    render(
      <ShortcutHarness
        onSave={jest.fn()}
        onHistory={jest.fn()}
        onUndo={jest.fn()}
        onRedo={onRedo}
        onDuplicate={jest.fn()}
      />,
    )

    fireWhenFocused(input, { key: "z", ctrlKey: true, shiftKey: true })

    expect(onRedo).not.toHaveBeenCalled()
  })

  it("still fires redo when the body is focused", () => {
    const onRedo = jest.fn()
    render(
      <ShortcutHarness
        onSave={jest.fn()}
        onHistory={jest.fn()}
        onUndo={jest.fn()}
        onRedo={onRedo}
        onDuplicate={jest.fn()}
      />,
    )

    fireEvent.keyDown(window, { key: "z", ctrlKey: true, shiftKey: true })

    expect(onRedo).toHaveBeenCalledTimes(1)
  })

  it("does not fire history when an input is focused", () => {
    const onHistory = jest.fn()
    const input = document.createElement("input")
    render(
      <ShortcutHarness
        onSave={jest.fn()}
        onHistory={onHistory}
        onUndo={jest.fn()}
        onRedo={jest.fn()}
        onDuplicate={jest.fn()}
      />,
    )

    fireWhenFocused(input, { key: "h", ctrlKey: true })

    expect(onHistory).not.toHaveBeenCalled()
  })

  it("still fires history when the body is focused", () => {
    const onHistory = jest.fn()
    render(
      <ShortcutHarness
        onSave={jest.fn()}
        onHistory={onHistory}
        onUndo={jest.fn()}
        onRedo={jest.fn()}
        onDuplicate={jest.fn()}
      />,
    )

    fireEvent.keyDown(window, { key: "h", ctrlKey: true })

    expect(onHistory).toHaveBeenCalledTimes(1)
  })

  it("does not fire duplicate page when an input is focused", () => {
    const onDuplicate = jest.fn()
    const input = document.createElement("input")
    render(
      <ShortcutHarness
        onSave={jest.fn()}
        onHistory={jest.fn()}
        onUndo={jest.fn()}
        onRedo={jest.fn()}
        onDuplicate={onDuplicate}
      />,
    )

    fireWhenFocused(input, { key: "d", ctrlKey: true, shiftKey: true })

    expect(onDuplicate).not.toHaveBeenCalled()
  })

  it("still fires duplicate page when the body is focused", () => {
    const onDuplicate = jest.fn()
    render(
      <ShortcutHarness
        onSave={jest.fn()}
        onHistory={jest.fn()}
        onUndo={jest.fn()}
        onRedo={jest.fn()}
        onDuplicate={onDuplicate}
      />,
    )

    fireEvent.keyDown(window, { key: "d", ctrlKey: true, shiftKey: true })

    expect(onDuplicate).toHaveBeenCalledTimes(1)
  })
})
