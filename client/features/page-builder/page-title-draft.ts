"use client"

import type React from "react"
import { useCallback, useRef, useState } from "react"

/**
 * Keeps an in-progress page title as local draft state and only commits it on
 * an explicit user action (Enter or blur), instead of on every keystroke.
 *
 * Without this, each keystroke dispatches a page update, which pushes a history
 * entry and makes undo/redo unusable for retyping a title. Escape restores the
 * last committed title without saving an intermediate value, and an empty or
 * whitespace-only draft is dropped rather than saved.
 *
 * @param committedTitle - The title currently stored on the page component.
 * @param onCommit - Called once with the non-empty trimmed title to persist.
 */
export function usePageTitleDraft(committedTitle: string, onCommit: (title: string) => void) {
  const [draft, setDraft] = useState<string | null>(null)
  // Enter blurs the field, and the blur commit must not repeat the Enter commit
  // when the committed page title has not reached this prop yet.
  const lastCommittedRef = useRef<string | null>(null)

  const value = draft ?? committedTitle

  const commit = useCallback(
    (next: string) => {
      setDraft(null)
      const trimmed = next.trim()
      if (!trimmed || trimmed === committedTitle || trimmed === lastCommittedRef.current) {
        return
      }
      lastCommittedRef.current = trimmed
      onCommit(trimmed)
    },
    [committedTitle, onCommit],
  )

  const revert = useCallback(() => {
    setDraft(null)
  }, [])

  const changeDraft = useCallback((next: string) => {
    setDraft(next)
  }, [])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault()
        commit(value)
        event.currentTarget.blur()
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        revert()
        event.currentTarget.blur()
      }
    },
    [commit, revert, value],
  )

  const handleBlur = useCallback(() => {
    commit(value)
  }, [commit, value])

  return {
    value,
    changeDraft,
    commit,
    revert,
    handleKeyDown,
    handleBlur,
  }
}
