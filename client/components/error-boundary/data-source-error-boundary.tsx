"use client"

import React from "react"
import { Button } from "@/client/components/ui/button"
import { RefreshCw, AlertTriangle, WifiOff } from "lucide-react"
import { cn } from "@/client/lib/utils"

interface DataSourceErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface DataSourceErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  isPreviewMode?: boolean
  onRetry?: () => void
}

export class DataSourceErrorBoundary extends React.Component<
  DataSourceErrorBoundaryProps,
  DataSourceErrorBoundaryState
> {
  state: DataSourceErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): DataSourceErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("[DataSourceErrorBoundary] Caught error:", error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isPreview = this.props.isPreviewMode

      return (
        <div
          className={cn(
            "flex min-h-[300px] w-full items-center justify-center p-8",
            isPreview && "border-2 border-destructive/50 bg-destructive/5"
          )}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex max-w-md flex-col items-center gap-4 text-center p-6">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full",
                isPreview
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted/50 text-muted-foreground"
              )}
            >
              {isPreview ? (
                <WifiOff className="h-8 w-8" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-8 w-8" aria-hidden="true" />
              )}
            </div>
            <div className="space-y-2">
              <h2 className={cn("text-xl font-semibold", isPreview ? "text-destructive" : "text-foreground")}>
                {isPreview ? "Data Source Unavailable" : "Couldn't Load Data"}
              </h2>
              <p className={cn("text-sm", isPreview ? "text-destructive/80" : "text-muted-foreground")}>
                {isPreview
                  ? "The data source failed to load. This content cannot be displayed in preview mode."
                  : "Something went wrong while loading data. The error has been logged to the console."}
              </p>
              {this.state.error && (
                <details className="text-left w-full max-w-xs rounded-md bg-muted p-3 text-xs font-mono text-muted-foreground">
                  <summary className="cursor-pointer font-medium text-foreground">Error details</summary>
                  <pre className="mt-2 overflow-auto whitespace-pre-wrap">{this.state.error.message}</pre>
                </details>
              )}
            </div>
            <Button
              onClick={this.handleRetry}
              className="gap-2"
              variant={isPreview ? "destructive" : "default"}
              size="lg"
            >
              <RefreshCw className="h-4 w-4" />
              {isPreview ? "Retry Loading Data" : "Reload Page"}
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}