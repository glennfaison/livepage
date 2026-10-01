/**
 * Whether prompt assist is switched on for this deployment. It is off unless
 * NEXT_PUBLIC_PROMPT_ASSIST_ENABLED is exactly "1". One flag serves both sides:
 * route handlers answer 404 when it is off, and the UI never renders the chat,
 * so the two cannot disagree. The NEXT_PUBLIC_ prefix makes Next.js inline the
 * value at build time, so changing it requires a rebuild. The name must be
 * spelled out in full here for that inlining to work.
 */
export function isPromptAssistEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PROMPT_ASSIST_ENABLED === "1"
}
