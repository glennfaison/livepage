"use client"

import { useEffect } from "react"
import type { Dispatch, SetStateAction } from "react"

/**
 * Hook that registers a global keyboard shortcut (Cmd/Ctrl+K) to toggle
 * the command palette open/closed.
 *
 * @param setCommandPaletteOpen - Setter function for the command palette open state
 */
export function useCommandPaletteShortcut(
  setCommandPaletteOpen: Dispatch<SetStateAction<boolean>>,
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey
      if (isModifierPressed && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setCommandPaletteOpen((open) => !open)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setCommandPaletteOpen])
}
