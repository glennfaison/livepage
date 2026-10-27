export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side error instrumentation can be extended here
  }
}

export const onRequestError = async (
  err: { digest: string } & Error,
  request: { path: string; method: string; headers: { [key: string]: string } },
  context: { routerKind: string; routePath: string; routeType: string; renderSource: string }
) => {
  if (process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED === "0" || process.env.NODE_ENV === "test") return
  const { captureServerException } = await import("./server/lib/observability")
  await captureServerException(err, {
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  })
}
