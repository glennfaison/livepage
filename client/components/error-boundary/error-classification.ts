"use client"

export type ErrorCategory =
  | "network"
  | "cors"
  | "timeout"
  | "auth"
  | "validation"
  | "render"
  | "unknown"

export interface ClassifiedError {
  category: ErrorCategory
  message: string
  userMessage: string
  recoveryActions: RecoveryAction[]
  technicalDetails?: string
}

export interface RecoveryAction {
  label: string
  action: "retry" | "reset" | "report" | "dismiss"
  variant?: "default" | "destructive" | "outline"
}

const ERROR_PATTERNS: ReadonlyArray<{
  category: ErrorCategory
  patterns: ReadonlyArray<RegExp>
  userMessage: string
  recoveryActions: RecoveryAction[]
}> = [
  {
    category: "network",
    patterns: [
      /network error/i,
      /failed to fetch/i,
      /fetch failed/i,
      /connection refused/i,
      /econnrefused/i,
      /enotfound/i,
      /eai_again/i,
      /offline/i,
      /no internet/i,
    ],
    userMessage: "Unable to connect to the server. Please check your internet connection and try again.",
    recoveryActions: [
      { label: "Try Again", action: "retry", variant: "default" },
      { label: "Dismiss", action: "dismiss", variant: "outline" },
    ],
  },
  {
    category: "cors",
    patterns: [
      /cors/i,
      /cross-origin/i,
      /access-control-allow-origin/i,
      /blocked by cors/i,
    ],
    userMessage: "The server blocked this request due to security policy. This usually means the data source doesn't allow requests from this domain.",
    recoveryActions: [
      { label: "Try Again", action: "retry", variant: "outline" },
      { label: "Report Issue", action: "report", variant: "outline" },
      { label: "Dismiss", action: "dismiss", variant: "outline" },
    ],
  },
  {
    category: "timeout",
    patterns: [
      /timeout/i,
      /timed out/i,
      /request took too long/i,
      /etimedout/i,
    ],
    userMessage: "The request took too long to complete. The server might be busy or the data source is slow to respond.",
    recoveryActions: [
      { label: "Try Again", action: "retry", variant: "default" },
      { label: "Dismiss", action: "dismiss", variant: "outline" },
    ],
  },
  {
    category: "auth",
    patterns: [
      /unauthorized/i,
      /401/i,
      /403/i,
      /forbidden/i,
      /authentication failed/i,
      /invalid token/i,
      /expired token/i,
      /access denied/i,
      /permission denied/i,
    ],
    userMessage: "You don't have permission to access this resource. You may need to sign in again or check your credentials.",
    recoveryActions: [
      { label: "Sign In Again", action: "retry", variant: "default" },
      { label: "Report Issue", action: "report", variant: "outline" },
      { label: "Dismiss", action: "dismiss", variant: "outline" },
    ],
  },
  {
    category: "validation",
    patterns: [
      /validation/i,
      /invalid/i,
      /malformed/i,
      /bad request/i,
      /400/i,
      /schema/i,
      /type error/i,
    ],
    userMessage: "The data received is invalid or malformed. This might be a temporary issue with the data source.",
    recoveryActions: [
      { label: "Try Again", action: "retry", variant: "outline" },
      { label: "Report Issue", action: "report", variant: "outline" },
      { label: "Dismiss", action: "dismiss", variant: "outline" },
    ],
  },
  {
    category: "render",
    patterns: [
      /render/i,
      /component/i,
      /element/i,
      /props/i,
      /children/i,
      /hydration/i,
    ],
    userMessage: "A component failed to render correctly. This is usually a temporary issue.",
    recoveryActions: [
      { label: "Reset Component", action: "reset", variant: "default" },
      { label: "Reload Page", action: "retry", variant: "outline" },
      { label: "Report Issue", action: "report", variant: "outline" },
    ],
  },
]

export function classifyError(error: Error | unknown): ClassifiedError {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  for (const { category, patterns, userMessage, recoveryActions } of ERROR_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(errorMessage)) {
        return {
          category,
          message: errorMessage,
          userMessage,
          recoveryActions,
          technicalDetails: errorStack,
        }
      }
    }
  }

  return {
    category: "unknown",
    message: errorMessage,
    userMessage: "An unexpected error occurred. Please try again or contact support if the problem persists.",
    recoveryActions: [
      { label: "Try Again", action: "retry", variant: "default" },
      { label: "Report Issue", action: "report", variant: "outline" },
      { label: "Dismiss", action: "dismiss", variant: "outline" },
    ],
    technicalDetails: errorStack,
  }
}

export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === "development"
}