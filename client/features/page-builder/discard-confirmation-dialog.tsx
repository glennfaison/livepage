"use client"

import React from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/components/ui/dialog"
import { Label } from "@/client/components/ui/label"
import { Switch } from "@/client/components/ui/switch"

/**
 * Confirmation dialog shown before all changes are discarded. Shared by the
 * toolbar discard button and the command palette "Discard all changes" command
 * so both surfaces ask (or skip) exactly the same way.
 */
export function DiscardConfirmationDialog({
  open,
  askBeforeDiscard,
  onCancel,
  onConfirm,
  onAskBeforeDiscardChange,
}: Readonly<{
  open: boolean
  /** Whether a discard should be confirmed; the switch toggles and persists this. */
  askBeforeDiscard: boolean
  onCancel: () => void
  onConfirm: () => void
  onAskBeforeDiscardChange: (ask: boolean) => void
}>) {
  const switchId = React.useId()

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="h-auto max-h-[90vh] w-[min(90vw,28rem)] max-w-md p-0">
        <DialogHeader className="border-b-0 px-6 py-0">
          <div className="space-y-2 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2.5 text-base font-semibold">
              <AlertTriangle
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
              />
              Discard all changes?
            </DialogTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This will reset the page to its initial state. This action cannot be undone.
            </p>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
            <Switch
              id={switchId}
              checked={askBeforeDiscard}
              onCheckedChange={onAskBeforeDiscardChange}
              className="mt-0.5"
            />
            <div className="space-y-0.5">
              <Label htmlFor={switchId} className="text-sm font-medium leading-none">
                Ask before discarding
              </Label>
              <p className="text-xs text-muted-foreground">
                You can change this preference anytime.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t bg-muted/20 px-6 py-4">
          <Button variant="ghost" onClick={onCancel} size="sm">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} size="sm">
            Discard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
