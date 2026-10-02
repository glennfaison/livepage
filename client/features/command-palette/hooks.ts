"use client"

import { useEffect } from "react"
import type { Dispatch, SetStateAction } from "react"

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
