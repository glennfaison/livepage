"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/components/ui/dialog"
import { KEYBOARD_SHORTCUTS } from "./keyboard-shortcuts"

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>) {
  const grouped = KEYBOARD_SHORTCUTS.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) acc[shortcut.category] = []
      acc[shortcut.category].push(shortcut)
      return acc
    },
    {} as Record<string, typeof KEYBOARD_SHORTCUTS[number][]>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {Object.entries(grouped).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{category}</h3>
              <ul className="space-y-2">
                {shortcuts.map((shortcut) => (
                  <li key={shortcut.keys} className="flex items-center justify-between text-sm">
                    <span>{shortcut.description}</span>
                    <kbd className="rounded border bg-muted px-2 py-0.5 font-mono text-xs">
                      {shortcut.keys}
                    </kbd>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
