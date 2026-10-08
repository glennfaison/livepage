"use client"

import { MessageCircle, X } from "lucide-react"
import { Suspense, useState, useEffect } from "react"
import type { AppAction } from "@/client/features/app-state"
import { AssistPanel } from "./assist-panel"
import { usePromptAssistEnabled } from "./availability"
import { isPromptAssistEnabled } from "@/shared/features/prompt-assist"
import { usePromptAssist } from "./use-prompt-assist"

const TOOLTIP_DISMISSED_KEY = "prompt-assist-tooltip-dismissed"

/**
 * Entry point used by the builder page. Renders nothing unless the deployment
 * flag is on and either the URL opts in with `?prompt-assist=1` or the
 * promptAssistEnabled setting is true. The Suspense boundary is required because
 * reading the query string opts a statically prerendered page into client-side
 * rendering.
 */
export function AssistChat(props: Readonly<{ dispatch: (action: AppAction) => void; enabled?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void }>) {
  if (!isPromptAssistEnabled()) return null
  return (
    <Suspense fallback={null}>
      <GatedAssistChat {...props} />
    </Suspense>
  )
}

function GatedAssistChat(props: Readonly<{ dispatch: (action: AppAction) => void; enabled?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void }>) {
  const urlEnabled = usePromptAssistEnabled()
  const isEnabled = props.enabled ?? urlEnabled
  return isEnabled ? <AssistChatSession {...props} /> : null
}

/**
 * Thin orchestrator for the page-assistant chat. Closed, it is a floating
 * round button (bottom-right); open, a small panel. Kept separate from the
 * page-builder Toolbar, which owns the bottom-center dock. The conversation
 * lives in the hook, so minimizing the panel does not lose it.
 */
function AssistChatSession(props: Readonly<{ dispatch: (action: AppAction) => void; open?: boolean; onOpenChange?: (open: boolean) => void }>) {
  const [open, setOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [showBubbleTooltip, setShowBubbleTooltip] = useState(false)
  const chat = usePromptAssist({ dispatch: props.dispatch })

  // Sync with controlled props if provided
  useEffect(() => {
    if (props.open !== undefined) {
      setOpen(props.open)
    }
  }, [props.open])

  // Show tooltip on first visit when chat is closed
  useEffect(() => {
    if (!open && typeof window !== "undefined") {
      const dismissed = window.localStorage.getItem(TOOLTIP_DISMISSED_KEY)
      if (!dismissed) {
        const timer = window.setTimeout(() => setShowTooltip(true), 1000)
        return () => window.clearTimeout(timer)
      }
    }
  }, [open])

  // Show bubble tooltip on hover when chat is closed
  const handleBubbleMouseEnter = () => {
    if (!open && typeof window !== "undefined") {
      const dismissed = window.localStorage.getItem(TOOLTIP_DISMISSED_KEY)
      if (!dismissed) {
        setShowBubbleTooltip(true)
      }
    }
  }

  const handleBubbleMouseLeave = () => {
    setShowBubbleTooltip(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    props.onOpenChange?.(nextOpen)
  }

  const dismissTooltip = () => {
    setShowTooltip(false)
    setShowBubbleTooltip(false)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOOLTIP_DISMISSED_KEY, "true")
    }
  }

  if (!open) {
    return (
      <>
        <button
          type="button"
          onClick={() => handleOpenChange(true)}
          onMouseEnter={handleBubbleMouseEnter}
          onMouseLeave={handleBubbleMouseLeave}
          aria-label="Open page assistant"
          className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
        {(showTooltip || showBubbleTooltip) && (
          <div className="fixed bottom-18 right-4 z-40 max-w-xs animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2">
            <div className="bg-background border rounded-lg shadow-lg p-3">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">AI Assistant</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click to describe a page in plain language. I'll pick a template, draft its content, and tune the design.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Or press <kbd className="px-1.5 py-0.5 bg-muted rounded">⌘K</kbd> and search "Open AI Assistant"
                  </p>
                </div>
                <button
                  type="button"
                  onClick={dismissTooltip}
                  aria-label="Dismiss"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-background border-l border-t border-transparent" />
            </div>
          </div>
        )}
      </>
    )
  }

  return <AssistPanel chat={chat} onClose={() => handleOpenChange(false)} />
}
