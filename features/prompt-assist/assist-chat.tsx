"use client"

import { MessageCircle } from "lucide-react"
import { Suspense, useState } from "react"
import type { AppAction } from "@/features/app-state"
import { AssistPanel } from "./assist-panel"
import { usePromptAssistEnabled } from "./availability"
import { usePromptAssist } from "./use-prompt-assist"

/**
 * Entry point used by the builder page. Renders nothing unless the URL opts in
 * with `?prompt-assist=1`. The Suspense boundary is required because reading the
 * query string opts a statically prerendered page into client-side rendering.
 */
export function AssistChat(props: Readonly<{ dispatch: (action: AppAction) => void }>) {
  return (
    <Suspense fallback={null}>
      <GatedAssistChat {...props} />
    </Suspense>
  )
}

function GatedAssistChat(props: Readonly<{ dispatch: (action: AppAction) => void }>) {
  return usePromptAssistEnabled() ? <AssistChatSession {...props} /> : null
}

/**
 * Thin orchestrator for the page-assistant chat. Closed, it is a floating
 * round button (bottom-right); open, a small panel. Kept separate from the
 * page-builder Toolbar, which owns the bottom-center dock. The conversation
 * lives in the hook, so minimizing the panel does not lose it.
 */
function AssistChatSession(props: Readonly<{ dispatch: (action: AppAction) => void }>) {
  const [open, setOpen] = useState(false)
  const chat = usePromptAssist({ dispatch: props.dispatch })

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open page assistant"
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    )
  }

  return <AssistPanel chat={chat} onClose={() => setOpen(false)} />
}
