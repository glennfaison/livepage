"use client"

import React from "react"
import { Button } from "@/client/components/ui/button"
import { RefreshCw, AlertTriangle, WifiOff, ShieldAlert, Clock, Lock, Bug, ExternalLink } from "lucide-react"
import { cn } from "@/client/lib/utils"
import { classifyError, isDevelopmentMode, type ClassifiedError, type RecoveryAction } from "./error-classification"

interface DataSourceErrorBoundaryState {
  hasError: boolean
  error: Error | null
  classifiedError: ClassifiedError | null
}

interface DataSourceErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  isPreviewMode?: boolean
  onRetry?: () => void
  onReport?: (error: ClassifiedError) => void
}

function getCategoryIcon(category: ClassifiedError["category"]): React.ReactNode {
  switch (category) {
    case "network":
      return <WifiOff className="h-8 w-8" aria-hidden="true" />
    case "cors":
      return <ShieldAlert className="h-8 w-8" aria-hidden="true" />
    case "timeout":
      return <Clock className="h-8 w-8" aria-hidden="true" />
    case "auth":
      return <Lock className="h-8 w-8" aria-hidden="true" />
    case "validation":
      return <AlertTriangle className="h-8 w-8" aria-hidden="true" />
    default:
      return <Bug className="h-8 w-8" aria-hidden="true" />
  }
}

function getCategoryBgClass(category: ClassifiedError["category"], isPreview: boolean): string {
  if (isPreview) {
    return "bg-destructive/10 text-destructive"
  }
  switch (category) {
    case "network":
      return "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
    case "cors":
      return "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
    case "timeout":
      return "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
    case "auth":
      return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
    case "validation":
      return "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
    default:
      return "bg-muted/50 text-muted-foreground"
  }
}

function getCategoryBorderClass(category: ClassifiedError["category"], isPreview: boolean): string {
  if (isPreview) {
    return "border-2 border-destructive/50 bg-destructive/5"
  }
  switch (category) {
    case "network":
      return "border-blue-200 dark:border-blue-800"
    case "cors":
      return "border-purple-200 dark:border-purple-800"
    case "timeout":
      return "border-orange-200 dark:border-orange-800"
    case "auth":
      return "border-red-200 dark:border-red-800"
    case "validation":
      return "border-yellow-200 dark:border-yellow-800"
    default:
      return "border-border"
  }
}

function renderRecoveryAction(
  action: RecoveryAction,
  onRetry: () => void,
  onReport?: (error: ClassifiedError) => void,
  classifiedError?: ClassifiedError | null,
  isPreview: boolean = false,
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
      {action.label}
    </Button>
  )
}

function shouldRenderDataSourceAction(action: RecoveryAction): boolean {
  return action.action === "retry" || action.action === "report"
}

export class DataSourceErrorBoundary extends React.Component<
  DataSourceErrorBoundaryProps,
  DataSourceErrorBoundaryState
> {
  state: DataSourceErrorBoundaryState = {
    hasError: false,
    error: null,
    classifiedError: null,
  }

  static getDerivedStateFromError(error: Error): DataSourceErrorBoundaryState {
    return { hasError: true, error, classifiedError: classifyError(error) }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("[DataSourceErrorBoundary] Caught error:", error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, classifiedError: null })
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  handleDismiss = (): void => {
    this.setState({ hasError: false, error: null, classifiedError: null })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isPreview = this.props.isPreviewMode ?? false
      const classified = this.state.classifiedError
      const categoryIcon = classified ? getCategoryIcon(classified.category) : (
        isPreview ? <WifiOff className="h-8 w-8" aria-hidden="true" /> : <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      )
      const iconBgClass = classified ? getCategoryBgClass(classified.category, isPreview) : (
        isPreview ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground"
      )
      const containerBorderClass = classified ? getCategoryBorderClass(classified.category, isPreview) : (
        isPreview ? "border-2 border-destructive/50 bg-destructive/5" : ""
      )
      const title = classified?.category
        ? `${classified.category.charAt(0).toUpperCase() + classified.category.slice(1)} Error`
        : (isPreview ? "Data Source Unavailable" : "Couldn't Load Data")
      const description = classified?.userMessage ?? (isPreview
        ? "The data source failed to load. This content cannot be displayed in preview mode."
        : "Something went wrong while loading data. The error has been logged to the console.")

      return (
        <div
          className={cn(
            "flex min-h-[300px] w-full items-center justify-center p-8",
            containerBorderClass
          )}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex max-w-md flex-col items-center gap-4 text-center p-6">
            <div className={cn("flex h-16 w-16 items-center justify-center rounded-full", iconBgClass)}>
              {categoryIcon}
            </div>
            <div className="space-y-2">
              <h2 className={cn("text-xl font-semibold", isPreview ? "text-destructive" : "text-foreground")}>
                {title}
              </h2>
              <p className={cn("text-sm", isPreview ? "text-destructive/80" : "text-muted-foreground")}>
                {description}
              </p>
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
                .filter(shouldRenderDataSourceAction)
                .map((action, index) => (
                  <span key={index}>
                    {renderRecoveryAction(
                      action,
                      this.handleRetry,
                      this.props.onReport,
                      classified,
                      isPreview,
                    )}
                  </span>
                ))}
              {classified?.recoveryActions
                .filter((action) => action.action === "dismiss")
                .map((action, index) => (
                  <span key={index}>
                    <Button
                      onClick={this.handleDismiss}
                      className="gap-2"
                      variant={action.variant ?? "outline"}
                      size="lg"
                    >
                      {action.label}
                    </Button>
                  </span>
                ))}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}