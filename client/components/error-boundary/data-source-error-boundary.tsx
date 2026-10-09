"use client"

import React from "react"
import { Button } from "@/client/components/ui/button"
import { RefreshCw, AlertTriangle, WifiOff, ShieldAlert, Clock, Server, Link as LinkIcon } from "lucide-react"
import { cn } from "@/client/lib/utils"

type DataSourceErrorType = "network" | "cors" | "timeout" | "auth" | "server" | "unknown"

interface DataSourceErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorType: DataSourceErrorType
}

interface DataSourceErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  isPreviewMode?: boolean
  onRetry?: () => void
  onReportIssue?: () => void
}

function getErrorType(error: Error): DataSourceErrorType {
  const message = error.message.toLowerCase()
  const name = error.name.toLowerCase()

  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection") ||
    name.includes("networkerror") ||
    name.includes("typeerror") && message.includes("failed to fetch")
  ) {
    return "network"
  }

  if (
    message.includes("cors") ||
    message.includes("cross-origin") ||
    message.includes("access-control-allow-origin")
  ) {
    return "cors"
  }

  if (
    message.includes("timeout") ||
    message.includes("timed out") ||
    name.includes("timeouterror") ||
    name.includes("aborterror")
  ) {
    return "timeout"
  }

  if (
    message.includes("unauthorized") ||
    message.includes("401") ||
    message.includes("403") ||
    message.includes("forbidden") ||
    message.includes("authentication") ||
    message.includes("authorization")
  ) {
    return "auth"
  }

  if (
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504") ||
    message.includes("server error")
  ) {
    return "server"
  }

  return "unknown"
}

function getErrorConfig(errorType: DataSourceErrorType, isPreview: boolean) {
  const configs: Record<DataSourceErrorType, {
    title: string
    description: string
    icon: React.ReactNode
    iconBg: string
    recoveryAction: string
    showReportIssue: boolean
  }> = {
    network: {
      title: isPreview ? "Data Source Unavailable" : "Connection Lost",
      description: isPreview
        ? "Unable to reach the data source. Check your network connection and try again."
        : "We couldn't connect to the server. Please check your internet connection and try again.",
      icon: <WifiOff className="h-8 w-8" aria-hidden="true" />,
      iconBg: isPreview ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground",
      recoveryAction: "Retry Connection",
      showReportIssue: false,
    },
    cors: {
      title: isPreview ? "Data Source Blocked" : "Access Blocked",
      description: isPreview
        ? "The data source blocked this request due to CORS policy. This content cannot be displayed in preview mode."
        : "The server's CORS policy prevents access from this origin. Contact the API provider to allow this domain.",
      icon: <ShieldAlert className="h-8 w-8" aria-hidden="true" />,
      iconBg: isPreview ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground",
      recoveryAction: "Open in New Tab",
      showReportIssue: true,
    },
    timeout: {
      title: isPreview ? "Request Timed Out" : "Loading Took Too Long",
      description: isPreview
        ? "The data source took too long to respond. This content cannot be displayed in preview mode."
        : "The request timed out. The server might be busy or unreachable. Try again in a moment.",
      icon: <Clock className="h-8 w-8" aria-hidden="true" />,
      iconBg: isPreview ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground",
      recoveryAction: "Try Again",
      showReportIssue: false,
    },
    auth: {
      title: isPreview ? "Authentication Required" : "Access Denied",
      description: isPreview
        ? "The data source requires authentication. This content cannot be displayed in preview mode."
        : "You don't have permission to access this resource. Please check your credentials or contact the administrator.",
      icon: <LinkIcon className="h-8 w-8" aria-hidden="true" />,
      iconBg: isPreview ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground",
      recoveryAction: "Sign In",
      showReportIssue: false,
    },
    server: {
      title: isPreview ? "Server Error" : "Server Unavailable",
      description: isPreview
        ? "The data source returned an error. This content cannot be displayed in preview mode."
        : "The server is experiencing issues. Our team has been notified. Please try again later.",
      icon: <Server className="h-8 w-8" aria-hidden="true" />,
      iconBg: isPreview ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground",
      recoveryAction: "Retry Later",
      showReportIssue: true,
    },
    unknown: {
      title: isPreview ? "Data Source Unavailable" : "Couldn't Load Data",
      description: isPreview
        ? "The data source failed to load. This content cannot be displayed in preview mode."
        : "Something went wrong while loading data. The error has been logged to the console.",
      icon: <AlertTriangle className="h-8 w-8" aria-hidden="true" />,
      iconBg: isPreview ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground",
      recoveryAction: "Try Again",
      showReportIssue: true,
    },
  }

  return configs[errorType]
}

export class DataSourceErrorBoundary extends React.Component<
  DataSourceErrorBoundaryProps,
  DataSourceErrorBoundaryState
> {
  state: DataSourceErrorBoundaryState = {
    hasError: false,
    error: null,
    errorType: "unknown",
  }

  static getDerivedStateFromError(error: Error): DataSourceErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorType: getErrorType(error),
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const errorType = getErrorType(error)
    console.error("[DataSourceErrorBoundary] Caught error:", {
      error: error.message,
      stack: error.stack,
      errorType,
      errorInfo,
    })
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorType: "unknown" })
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  handleReportIssue = (): void => {
    if (this.props.onReportIssue) {
      this.props.onReportIssue()
    } else if (this.state.error) {
      const errorDetails = encodeURIComponent(
        `Error: ${this.state.error.message}\nStack: ${this.state.error.stack}\nType: ${this.state.errorType}`
      )
      window.open(
        `https://github.com/glennfaison/livepage/issues/new?title=Data%20Source%20Error&body=${errorDetails}`,
        "_blank"
      )
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isPreview = this.props.isPreviewMode
      const config = getErrorConfig(this.state.errorType, isPreview)

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
                config.iconBg
              )}
            >
              {config.icon}
            </div>
            <div className="space-y-2">
              <h2 className={cn("text-xl font-semibold", isPreview ? "text-destructive" : "text-foreground")}>
                {config.title}
              </h2>
              <p className={cn("text-sm", isPreview ? "text-destructive/80" : "text-muted-foreground")}>
                {config.description}
              </p>
              {this.state.error && process.env.NODE_ENV === "development" && (
                <details className="text-left w-full max-w-xs rounded-md bg-muted p-3 text-xs font-mono text-muted-foreground">
                  <summary className="cursor-pointer font-medium text-foreground">Error details (development)</summary>
                  <pre className="mt-2 overflow-auto whitespace-pre-wrap">{this.state.error.message}</pre>
                  {this.state.error.stack && (
                    <pre className="mt-2 overflow-auto whitespace-pre-wrap">{this.state.error.stack}</pre>
                  )}
                </details>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
              <Button
                onClick={this.handleRetry}
                className="gap-2 flex-1"
                variant={isPreview ? "destructive" : "default"}
                size="lg"
              >
                <RefreshCw className="h-4 w-4" />
                {config.recoveryAction}
              </Button>
              {config.showReportIssue && (
                <Button
                  onClick={this.handleReportIssue}
                  className="gap-2 flex-1"
                  variant="outline"
                  size="lg"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Report Issue
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