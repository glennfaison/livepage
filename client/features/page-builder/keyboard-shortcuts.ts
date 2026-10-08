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

export function useCopyStylesShortcut(onCopyStyles: () => void, canCopy: boolean) {
  useEffect(() => {
    if (!canCopy) return
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMetaOrCtrl = event.metaKey || event.ctrlKey
      const isAlt = event.altKey
      if (isMetaOrCtrl && isAlt && event.key.toLowerCase() === "c") {
        event.preventDefault()
        onCopyStyles()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onCopyStyles, canCopy])
}

export function usePasteStylesShortcut(onPasteStyles: () => void, canPaste: boolean) {
  useEffect(() => {
    if (!canPaste) return
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMetaOrCtrl = event.metaKey || event.ctrlKey
      const isAlt = event.altKey
      if (isMetaOrCtrl && isAlt && event.key.toLowerCase() === "v") {
        event.preventDefault()
        onPasteStyles()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onPasteStyles, canPaste])
}

export function formatShortcut(key: string): string {
  if (typeof navigator !== "undefined" && navigator.platform.includes("Mac")) {
    return `⌘${key.toUpperCase()}`
  }
  return `Ctrl+${key.toUpperCase()}`
}

export function formatAltShortcut(key: string): string {
  if (typeof navigator !== "undefined" && navigator.platform.includes("Mac")) {
    return `⌘⌥${key.toUpperCase()}`
  }
  return `Ctrl+Alt+${key.toUpperCase()}`
}