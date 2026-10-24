"use client"

import { useEffect } from "react"
import type { Dispatch, SetStateAction } from "react"

export function useSaveShortcut(onSave: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey
      if (isModifierPressed && event.key.toLowerCase() === "s") {
        event.preventDefault()
        onSave()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onSave])
}

export function useHistoryShortcut(onOpenHistory: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey
      if (isModifierPressed && event.key.toLowerCase() === "h") {
        event.preventDefault()
        onOpenHistory()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onOpenHistory])
}

export function useUndoShortcut(onUndo: () => void, canUndo: boolean) {
  useEffect(() => {
    if (!canUndo) return
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey
      if (isModifierPressed && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault()
        onUndo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onUndo, canUndo])
}

export function useRedoShortcut(onRedo: () => void, canRedo: boolean) {
  useEffect(() => {
    if (!canRedo) return
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey
      if (isModifierPressed && event.key.toLowerCase() === "z" && event.shiftKey) {
        event.preventDefault()
        onRedo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onRedo, canRedo])
}

export function useDuplicatePageShortcut(onDuplicate: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey
      if (isModifierPressed && event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault()
        onDuplicate()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onDuplicate])
}

export function useToolbarToggleShortcut(onToggle: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey
      if (isModifierPressed && event.key.toLowerCase() === "`") {
        event.preventDefault()
        onToggle()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onToggle])
}

export function formatShortcut(key: string): string {
  if (typeof navigator !== "undefined" && navigator.platform.includes("Mac")) {
    return `⌘${key.toUpperCase()}`
  }
  return `Ctrl+${key.toUpperCase()}`
}
export const KEYBOARD_SHORTCUTS = [
  { keys: "⌘K / Ctrl+K", description: "Open command palette", category: "Navigation" },
  { keys: "⌘S / Ctrl+S", description: "Save page", category: "Editing" },
  { keys: "⌘Z / Ctrl+Z", description: "Undo", category: "Editing" },
  { keys: "⌘⇧Z / Ctrl+Shift+Z", description: "Redo", category: "Editing" },
  { keys: "⌘H / Ctrl+H", description: "Open history", category: "Editing" },
  { keys: "⌘⇧D / Ctrl+Shift+D", description: "Duplicate page", category: "Editing" },
  { keys: "⌘` / Ctrl+`", description: "Toggle toolbar", category: "View" },
  { keys: "?", description: "Show keyboard shortcuts", category: "Help" },
  { keys: "Escape", description: "Close dialogs and popovers", category: "Navigation" },
] as const

export function useKeyboardShortcutsHelp(onOpen: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "?") return
      // Don't trigger in inputs, textareas, or contenteditable
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest("[contenteditable=true]"))
      ) {
        return
      }
      event.preventDefault()
      onOpen()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onOpen])
}
