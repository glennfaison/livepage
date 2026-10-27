"use client"

import posthog from "posthog-js"

const isEnabled = () => {
  if (typeof window === "undefined") return false
  if (process.env.NODE_ENV === "test") return false
  if (process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED === "0") return false
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY)
}

export function initPostHog(): void {
  if (!isEnabled()) return
  if (posthog.__loaded) return

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "*", // mask all text to protect builder canvas content
    },
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.opt_out_capturing()
      }
    },
  })

  // Capture uncaught exceptions and unhandled rejections
  window.addEventListener("error", (event) => {
    captureException(event.error || event.message, { source: "window.error" })
  })
  window.addEventListener("unhandledrejection", (event) => {
    captureException(event.reason, { source: "unhandledrejection" })
  })
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!isEnabled() || !posthog.__loaded) return
  posthog.captureException(error, context)
}

export function captureEvent(event: string, properties?: Record<string, unknown>): void {
  if (!isEnabled() || !posthog.__loaded) return
  posthog.capture(event, properties)
}

export { posthog }
