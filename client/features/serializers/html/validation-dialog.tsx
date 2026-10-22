"use client"

import { AlertCircle, CheckCircle, Info, X } from "lucide-react"
import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/client/components/ui/dialog"
import { Button } from "@/client/components/ui/button"
import { cn } from "@/client/lib/utils"
import type { ValidationResult } from "./validation"

type ValidationDialogProps = Readonly<{
  validation: ValidationResult
  onProceed: () => void
  onCancel: () => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
}>

export function ValidationDialog(props: ValidationDialogProps) {
  const { validation, onProceed, onCancel, isOpen, onOpenChange, trigger } = props

  if (!validation.hasErrors && !validation.hasWarnings) {
    return null
  }

  const errors = validation.issues.filter((issue) => issue.type === "error")
  const warnings = validation.issues.filter((issue) => issue.type === "warning")

  const summary =
    errors.length > 0
      ? `${errors.length} error${errors.length === 1 ? "" : "s"}${warnings.length > 0 ? ` · ${warnings.length} warning${warnings.length === 1 ? "" : "s"}` : ""}`
      : `${warnings.length} warning${warnings.length === 1 ? "" : "s"}`

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-lg h-auto max-h-[min(80vh,36rem)] w-[min(92vw,32rem)] overflow-hidden p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <span>Export Validation</span>
          </DialogTitle>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {summary}. Review before exporting.
          </p>
        </DialogHeader>

        <div className="max-h-[min(50vh,24rem)] overflow-y-auto px-5 py-3">
          <div className="space-y-2.5">
            {errors.map((issue, index) => (
              <div
                key={`error-${index}`}
                className={cn(
                  "flex items-start gap-3 rounded-md border p-3",
                  "bg-destructive/10 border-destructive/20",
                )}
              >
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{issue.message}</p>
                  {issue.componentTag && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Component: <code className="rounded bg-muted px-1 py-0.5">{issue.componentTag}</code>
                      {issue.componentId && ` (${issue.componentId})`}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {warnings.map((issue, index) => (
              <div
                key={`warning-${index}`}
                className={cn(
                  "flex items-start gap-3 rounded-md border p-3",
                  "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
                )}
              >
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Warning</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{issue.message}</p>
                  {issue.componentTag && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Component: <code className="rounded bg-muted px-1 py-0.5">{issue.componentTag}</code>
                      {issue.componentId && ` (${issue.componentId})`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-5 py-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1.5" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onProceed}
            variant={errors.length > 0 ? "destructive" : "default"}
            disabled={errors.length > 0}
          >
            {errors.length > 0 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Fix errors first
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Proceed anyway
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}