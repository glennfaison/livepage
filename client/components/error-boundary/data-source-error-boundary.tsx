"use client"

import React from "react"
import { Button } from "@/client/components/ui/button"
import { RefreshCw, AlertTriangle, Database } from "lucide-react"
import { cn } from "@/client/lib/utils"

interface DataSourceErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface DataSourceErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  dataSourceId?: string
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
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={cn("flex min-h-[200px] w-full items-center justify-center p-6")}>
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive")}>
              <Database className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Data Source Error</h2>
              <p className="text-sm text-muted-foreground">
                Failed to load data from the data source. The error has been logged to the console.
              </p>
              {this.props.dataSourceId && (
                <p className="text-xs text-muted-foreground font-mono">
                  Data source: {this.props.dataSourceId}
                </p>
              )}
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
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}