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

export function useCopyStylesShortcut(onCopyStyles: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey
      const isAltPressed = event.altKey
      if (isModifierPressed && isAltPressed && event.key.toLowerCase() === "c") {
        event.preventDefault()
        onCopyStyles()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onCopyStyles])
}

export function usePasteStylesShortcut(onPasteStyles: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey
      const isAltPressed = event.altKey
      if (isModifierPressed && isAltPressed && event.key.toLowerCase() === "v") {
        event.preventDefault()
        onPasteStyles()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onPasteStyles])
}

export function useDuplicatePageShortcut(onDuplicatePage: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey
      if (isModifierPressed && event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault()
        onDuplicatePage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onDuplicatePage])
}

export function formatShortcut(key: string): string {
  if (typeof navigator !== "undefined" && navigator.platform.includes("Mac")) {
    return `⌘${key.toUpperCase()}`
  }
  return `Ctrl+${key.toUpperCase()}`
}

export function formatPainterShortcut(key: string): string {
  if (typeof navigator !== "undefined" && navigator.platform.includes("Mac")) {
    return `⌘⌥${key.toUpperCase()}`
  }
  return `Ctrl+Alt+${key.toUpperCase()}`
}

export function formatDuplicatePageShortcut(): string {
  if (typeof navigator !== "undefined" && navigator.platform.includes("Mac")) {
    return "⌘⇧D"
  }
  return "Ctrl+Shift+D"
}

export function formatRedoShortcut(): string {
  if (typeof navigator !== "undefined" && navigator.platform.includes("Mac")) {
    return "⌘⇧Z"
  }
  return "Ctrl+Shift+Z"
}