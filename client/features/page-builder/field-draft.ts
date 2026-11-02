"use client"

import type React from "react"
import { useCallback, useRef, useState } from "react"

/**
 * Keeps an in-progress field value as a local draft and only commits it on an
 * explicit user action (blur, or Enter for single-line inputs), instead of on
 * every keystroke.
 *
 * Without this, each keystroke dispatches an update, which pushes a history
 * entry and makes undo/redo unusable for retyping a value. Escape restores the
 * last committed value without saving an intermediate value, and an empty or
 * whitespace-only draft is dropped rather than saved.
 *
 * @param committedValue - The value currently stored on the component.
 * @param onCommit - Called once with the non-empty trimmed value to persist.
 * @param options.commitOnEnter - Commit on Enter (single-line inputs). Defaults
 *   to true. Set false for multi-line textareas where Enter means newline.
 */
export function useFieldDraft(
  committedValue: string,
  onCommit: (value: string) => void,
  options: { commitOnEnter?: boolean } = {},
) {
  const { commitOnEnter = true } = options
  const [draft, setDraft] = useState<string | null>(null)
  // Enter blurs the field, and the blur commit must not repeat the Enter commit
  // when the committed value has not reached this prop yet.
  const lastCommittedRef = useRef<string | null>(null)

  const value = draft ?? committedValue

  const commit = useCallback(
    (next: string) => {
      setDraft(null)
      const trimmed = next.trim()
      if (!trimmed || trimmed === committedValue || trimmed === lastCommittedRef.current) {
        return
      }
      lastCommittedRef.current = trimmed
      onCommit(trimmed)
    },
    [committedValue, onCommit],
  )

  const revert = useCallback(() => {
    setDraft(null)
  }, [])

  const changeDraft = useCallback((next: string) => {
    setDraft(next)
  }, [])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.key === "Enter" && commitOnEnter) {
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
    [commit, revert, value, commitOnEnter],
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
