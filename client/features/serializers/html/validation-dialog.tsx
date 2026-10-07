"use client"

import { AlertCircle, CheckCircle, Info, X } from "lucide-react"
import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/client/components/ui/dialog"
import { Button } from "@/client/components/ui/button"
import { cn } from "@/client/lib/utils"
import type { ValidationResult, ValidationIssue } from "./validation"

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Export Validation
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {errors.length > 0
              ? `${errors.length} error${errors.length > 1 ? "s" : ""}${warnings.length > 0 ? `, ${warnings.length} warning${warnings.length > 1 ? "s" : ""}` : ""} found`
              : `${warnings.length} warning${warnings.length > 1 ? "s" : ""} found`}
            . Review before exporting.
          </p>
        </DialogHeader>

        <div className="my-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            {errors.map((issue, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border",
                  "bg-destructive/10 border-destructive/20",
                )}
              >
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-destructive">Error</p>
                  <p className="mt-1 text-sm text-muted-foreground">{issue.message}</p>
                  {issue.componentTag && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Component: <code>{issue.componentTag}</code>
                      {issue.componentId && ` (${issue.componentId})`}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {warnings.map((issue, index) => (
              <div
                key={index + errors.length}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border",
                  "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
                )}
              >
                <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Warning</p>
                  <p className="mt-1 text-sm text-muted-foreground">{issue.message}</p>
                  {issue.componentTag && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Component: <code>{issue.componentTag}</code>
                      {issue.componentId && ` (${issue.componentId})`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between border-t px-4 py-3">
          <Button variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={onProceed}
            variant={errors.length > 0 ? "destructive" : "default"}
            disabled={errors.length > 0}
          >
            {errors.length > 0 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Cannot proceed - fix errors first
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Proceed anyway
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}