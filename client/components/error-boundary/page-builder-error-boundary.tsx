"use client"

import React from "react"
import { Button } from "@/client/components/ui/button"
import { RefreshCw, AlertTriangle, RotateCcw, Bug, ExternalLink } from "lucide-react"
import { cn } from "@/client/lib/utils"
import { logger } from "@/client/lib/logger"
import { classifyError, isDevelopmentMode, type ClassifiedError, type RecoveryAction } from "./error-classification"

interface PageBuilderErrorBoundaryState {
  hasError: boolean
  error: Error | null
  classifiedError: ClassifiedError | null
}

interface PageBuilderErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onResetComponent?: () => void
  onReport?: (error: ClassifiedError) => void
}

function renderRecoveryAction(
  action: RecoveryAction,
  onRetry: () => void,
  onResetComponent: () => void,
  onReport?: (error: ClassifiedError) => void,
  classifiedError?: ClassifiedError | null,
): React.ReactNode {
  const handleClick = () => {
    switch (action.action) {
      case "retry":
        onRetry()
        break
      case "reset":
        onResetComponent()
        break
      case "report":
        if (onReport && classifiedError) {
          onReport(classifiedError)
        }
        break
      case "dismiss":
        break
    }
  }

  const variant = action.variant ?? (action.action === "retry" ? "default" : "outline")

  return (
    <Button
      onClick={handleClick}
      className="gap-2"
      variant={variant}
      size="lg"
    >
      {action.action === "retry" && <RefreshCw className="h-4 w-4" />}
      {action.action === "reset" && <RotateCcw className="h-4 w-4" />}
      {action.action === "report" && <ExternalLink className="h-4 w-4" />}
      {action.label}
    </Button>
  )
}

function shouldRenderAction(
  action: RecoveryAction,
  onResetComponent?: () => void,
): boolean {
  if (action.action === "reset") {
    return !!onResetComponent
  }
  return action.action === "retry" || action.action === "report"
}

export class PageBuilderErrorBoundary extends React.Component<
  PageBuilderErrorBoundaryProps,
  PageBuilderErrorBoundaryState
> {
  state: PageBuilderErrorBoundaryState = {
    hasError: false,
    error: null,
    classifiedError: null,
  }

  static getDerivedStateFromError(error: Error): PageBuilderErrorBoundaryState {
    return { hasError: true, error, classifiedError: classifyError(error) }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error("[PageBuilderErrorBoundary] Caught error:", {
      error: error.message,
      stack: error.stack,
      errorInfo,
    })
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, classifiedError: null })
    window.location.reload()
  }

  handleResetComponent = (): void => {
    this.setState({ hasError: false, error: null, classifiedError: null })
    if (this.props.onResetComponent) {
      this.props.onResetComponent()
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const classified = this.state.classifiedError
      const title = classified?.category
        ? `${classified.category.charAt(0).toUpperCase() + classified.category.slice(1)} Error`
        : "Couldn't build this page"
      const description = classified?.userMessage ?? "Something went wrong while rendering the page. The error has been logged to the console."

      return (
        <div className={cn("flex min-h-[400px] w-full items-center justify-center p-8")}>
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <div className={cn("flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive")}>
              <Bug className="h-8 w-8" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
              {(classified?.technicalDetails || this.state.error) && (
                <details className="text-left w-full max-w-xs rounded-md bg-muted p-3 text-xs font-mono text-muted-foreground">
                  <summary className="cursor-pointer font-medium text-foreground">
                    {isDevelopmentMode() ? "Error details (development)" : "Error details"}
                  </summary>
                  <pre className="mt-2 overflow-auto whitespace-pre-wrap">
                    {classified?.technicalDetails ?? this.state.error?.message}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              {classified?.recoveryActions
                .filter((action) => shouldRenderAction(action, this.props.onResetComponent))
                .map((action, index) => (
                  <span key={index}>
                    {renderRecoveryAction(
                      action,
                      this.handleRetry,
                      this.handleResetComponent,
                      this.props.onReport,
                      classified,
                    )}
                  </span>
                ))}
              {/* Always show reload as fallback */}
              {!classified?.recoveryActions.some((a) => a.action === "retry") && (
                <Button onClick={this.handleRetry} className="gap-2" variant="default" size="lg">
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}