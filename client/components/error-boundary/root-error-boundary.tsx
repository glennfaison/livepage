"use client"

import React from "react"
import { Button } from "@/client/components/ui/button"
import { RefreshCw, AlertTriangle, Bug, ExternalLink, Copy } from "lucide-react"
import { cn } from "@/client/lib/utils"
import { logger } from "@/client/lib/logger"
import { classifyError, isDevelopmentMode, type ClassifiedError, type RecoveryAction } from "./error-classification"

interface RootErrorBoundaryState {
  hasError: boolean
  error: Error | null
  classifiedError: ClassifiedError | null
  copied: boolean
}

interface RootErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReport?: (error: ClassifiedError) => void
}

function renderRecoveryAction(
  action: RecoveryAction,
  onRetry: () => void,
  onReport?: (error: ClassifiedError) => void,
  classifiedError?: ClassifiedError | null,
  onCopyError?: () => void,
): React.ReactNode {
  const handleClick = () => {
    switch (action.action) {
      case "retry":
        onRetry()
        break
      case "report":
        if (onReport && classifiedError) {
          onReport(classifiedError)
        }
        break
      case "dismiss":
        break
      case "reset":
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
      {action.action === "report" && <ExternalLink className="h-4 w-4" />}
      {action.action === "dismiss" && <AlertTriangle className="h-4 w-4" />}
      {action.label}
    </Button>
  )
}

function shouldRenderRootAction(action: RecoveryAction): boolean {
  return action.action === "retry" || action.action === "report"
}

export class RootErrorBoundary extends React.Component<
  RootErrorBoundaryProps,
  RootErrorBoundaryState
> {
  state: RootErrorBoundaryState = {
    hasError: false,
    error: null,
    classifiedError: null,
    copied: false,
  }

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { hasError: true, error, classifiedError: classifyError(error), copied: false }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error("[RootErrorBoundary] Caught error:", {
      error: error.message,
      stack: error.stack,
      errorInfo: errorInfo.componentStack,
    })
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, classifiedError: null, copied: false })
    window.location.reload()
  }

  handleCopyError = async (): Promise<void> => {
    const classified = this.state.classifiedError
    const error = this.state.error
    const errorText = [
      "Error Report",
      "============",
      `Category: ${classified?.category ?? "unknown"}`,
      `Message: ${classified?.message ?? error?.message ?? "Unknown error"}`,
      `User Message: ${classified?.userMessage ?? "N/A"}`,
      `Stack: ${classified?.technicalDetails ?? error?.stack ?? "N/A"}`,
      `Timestamp: ${new Date().toISOString()}`,
      `User Agent: ${navigator.userAgent}`,
      `URL: ${window.location.href}`,
    ].join("\n")

    try {
      await navigator.clipboard.writeText(errorText)
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2000)
    } catch {
      // Clipboard API failed, ignore
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
        : "Something went wrong"
      const description = classified?.userMessage ?? "An unexpected error occurred. The error has been logged to the console."

      return (
        <div className={cn("flex min-h-screen w-full items-center justify-center p-8")}>
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
                    {classified?.technicalDetails && this.state.error?.stack && "\n\n" + this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              {classified?.recoveryActions
                .filter(shouldRenderRootAction)
                .map((action, index) => (
                  <span key={index}>
                    {renderRecoveryAction(action, this.handleRetry, this.props.onReport, classified)}
                  </span>
                ))}
              {/* Always show reload as fallback */}
              {!classified?.recoveryActions.some((a) => a.action === "retry") && (
                <Button onClick={this.handleRetry} className="gap-2" variant="default" size="lg">
                  <RefreshCw className="h-4 w-4" />
                  Reload Application
                </Button>
              )}
              <Button
                onClick={this.handleCopyError}
                className="gap-2"
                variant="outline"
                size="lg"
                aria-label={this.state.copied ? "Copied to clipboard" : "Copy error details"}
              >
                {this.state.copied ? (
                  <>
                    <Copy className="h-4 w-4 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Error
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}