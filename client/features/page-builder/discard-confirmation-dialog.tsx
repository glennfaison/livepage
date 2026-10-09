"use client"

import React from "react"
import { X } from "lucide-react"
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X className="h-5 w-5 text-destructive" />
            Discard all changes?
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            This will reset the page to its initial state. This action cannot be undone.
          </p>
        </DialogHeader>
        <div className="flex items-center gap-2 py-2">
          <Switch
            id={switchId}
            checked={askBeforeDiscard}
            onCheckedChange={onAskBeforeDiscardChange}
          />
          <Label htmlFor={switchId} className="text-sm font-normal">
            Ask before discarding
          </Label>
        </div>
        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Discard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
