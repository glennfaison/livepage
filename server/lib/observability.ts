import { PostHog } from "posthog-node"

let client: PostHog | null = null

function getClient(): PostHog | null {
  if (process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED === "0") return null
  if (process.env.NODE_ENV === "test") return null
  const key = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return null
  if (!client) {
    client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    })
  }
  return client
}

export async function captureServerException(error: unknown, context?: Record<string, unknown>): Promise<void> {
  const ph = getClient()
  if (!ph) return
  const err = error instanceof Error ? error : new Error(String(error))
  ph.captureException(err, undefined, context)
  await ph.shutdown()
}

export async function captureServerEvent(event: string, properties?: Record<string, unknown>): Promise<void> {
  const ph = getClient()
  if (!ph) return
  ph.capture({ distinctId: "server", event, properties })
  await ph.shutdown()
}
