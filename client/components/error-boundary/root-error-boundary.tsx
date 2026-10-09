"use client"

import React from "react"
import { Button } from "@/client/components/ui/button"
import { RefreshCw, AlertTriangle } from "lucide-react"
import { cn } from "@/client/lib/utils"
import { logger } from "@/client/lib/logger"

interface RootErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface RootErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class RootErrorBoundary extends React.Component<
  RootErrorBoundaryProps,
  RootErrorBoundaryState
> {
  state: RootErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error("[RootErrorBoundary] Caught error:", {
      error: error.message,
      stack: error.stack,
      errorInfo: errorInfo.componentStack,
    })
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={cn("flex min-h-screen w-full items-center justify-center p-8")}>
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <div className={cn("flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive")}>
              <AlertTriangle className="h-8 w-8" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred. The error has been logged to the console.
              </p>
              {this.state.error && (
                <details className="text-left w-full max-w-xs rounded-md bg-muted p-3 text-xs font-mono text-muted-foreground">
                  <summary className="cursor-pointer font-medium text-foreground">Error details</summary>
                  <pre className="mt-2 overflow-auto whitespace-pre-wrap">{this.state.error.message}</pre>
                  {this.state.error.stack && (
                    <pre className="mt-2 overflow-auto whitespace-pre-wrap">{this.state.error.stack}</pre>
                  )}
                </details>
              )}
            </div>
            <Button
              onClick={this.handleRetry}
              className="gap-2"
              variant="default"
              size="lg"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Application
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}