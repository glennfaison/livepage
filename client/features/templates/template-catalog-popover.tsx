"use client"

import React from "react"
import { Button } from "@/client/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/client/components/ui/popover"
import type { TemplateDisplaySummary } from "./registry"
import { LayoutTemplate } from "lucide-react"
import { TemplateCatalog } from "./template-catalog"

export function TemplateCatalogPopover({
  templates,
  onApplyTemplate,
}: Readonly<{
  templates: ReadonlyArray<TemplateDisplaySummary>
  onApplyTemplate: (templateId: string) => void
}>) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 px-2 sm:px-3" aria-label="Templates">
          <LayoutTemplate className="h-4 w-4" />
          <span className="hidden sm:inline">Templates</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(52rem,calc(100vw-2rem))] flex max-h-[min(80vh,48rem)] flex-col overflow-hidden p-0">
        <TemplateCatalog
          templates={templates}
          onApplyTemplate={onApplyTemplate}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}