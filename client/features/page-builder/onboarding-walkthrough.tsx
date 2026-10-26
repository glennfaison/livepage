"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/client/components/ui/button"

const ONBOARDING_COMPLETED_KEY = "livepage-onboarding-completed"
const SHOW_DELAY_MS = 1200

interface Step {
  title: string
  description: string
  selector: string
}

const STEPS: Step[] = [
  {
    title: "Add a component",
    description: "Open the command palette (⌘K) or the in-canvas picker to add components to your page.",
    selector: '[data-onboarding="command"]',
  },
  {
    title: "Edit properties",
    description: "Select a component, then open Settings in the toolbar to change its attributes and style.",
    selector: '[data-testid="toolbar-settings-trigger"]',
  },
  {
    title: "Reorder with drag-and-drop",
    description: "Drag components on the canvas to reorder them. Drop indicators show where they will land.",
    selector: '[data-onboarding="canvas"]',
  },
  {
    title: "Switch edit / preview",
    description: "Toggle between Edit and Preview modes to see how your page looks without the builder chrome.",
    selector: '[data-onboarding="mode-toggle"]',
  },
]

function isCompleted(): boolean {
  if (typeof window === "undefined") return true
  return window.localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true"
}

function markCompleted(): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true")
}

export function OnboardingWalkthrough() {
  const [visible, setVisible] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (isCompleted()) return
    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible) return
    const step = STEPS[stepIndex]
    const el = document.querySelector(step.selector)
    if (!el) {
      setPosition({ top: 120, left: 40 })
      return
    }
    const rect = el.getBoundingClientRect()
    setPosition({
      top: Math.min(rect.bottom + 12, window.innerHeight - 180),
      left: Math.min(rect.left, window.innerWidth - 320),
    })
  }, [visible, stepIndex])

  if (!visible || isCompleted()) return null

  const step = STEPS[stepIndex]
  const isLast = stepIndex === STEPS.length - 1

  const advance = () => {
    if (isLast) {
      markCompleted()
      setVisible(false)
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  const dismiss = () => {
    markCompleted()
    setVisible(false)
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div
        className="pointer-events-auto absolute w-80 max-w-[calc(100vw-2rem)] rounded-lg border bg-background p-4 shadow-lg"
        style={position ? { top: position.top, left: position.left } : { top: 120, left: 40 }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{step.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss onboarding"
            className="shrink-0 rounded p-0.5 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {stepIndex + 1} / {STEPS.length}
          </span>
          <Button size="sm" onClick={advance}>
            {isLast ? "Done" : "Got it"}
          </Button>
        </div>
      </div>
    </div>
  )
}
