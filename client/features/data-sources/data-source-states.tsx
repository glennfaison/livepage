import React from "react"
import { cn } from "@/client/lib/utils"
import { Button } from "@/client/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"

export function readableErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === "string") return message
  }
  if (typeof error === "string") {
    return error
  }
  return "An unknown error occurred"
}

interface DataSourceStateProps {
  childClassName?: string
  retry?: () => void
  errorMessage?: string
}

export function DataSourceLoading({ childClassName }: DataSourceStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 py-6 text-muted-foreground",
        childClassName
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading data"
    >
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span>Loading…</span>
    </div>
  )
}

export function DataSourceError({ childClassName, retry, errorMessage }: DataSourceStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-6 text-center text-destructive",
        childClassName
      )}
      role="alert"
      aria-live="assertive"
    >
      <p className="text-sm">{errorMessage ?? "Failed to load data"}</p>
      {retry && (
        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          className="gap-1.5"
          aria-label="Retry loading data"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </Button>
      )}
    </div>
  )
}