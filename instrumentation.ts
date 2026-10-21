export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "edge") {
    return
  }
  const { validateEnv } = await import("./server/lib/env")
  validateEnv()
}
