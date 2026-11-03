"use client"

import React from "react"
import { Button } from "@/client/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/client/components/ui/popover"
import type { PageTemplateDisplaySummary } from "./registry"
import { LayoutTemplate } from "lucide-react"
import { PageTemplateCatalog } from "./page-template-catalog"

export function PageTemplateCatalogPopover({
  templates,
  onApplyPageTemplate,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: Readonly<{
  templates: ReadonlyArray<PageTemplateDisplaySummary>
  onApplyPageTemplate: (templateId: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}>) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = controlledOnOpenChange ?? setInternalOpen

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 px-2 sm:px-3" aria-label="Page Templates">
          <LayoutTemplate className="h-4 w-4" />
          <span className="hidden sm:inline">Page Templates</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(52rem,calc(100vw-2rem))] flex max-h-[min(80vh,48rem)] flex-col overflow-hidden p-0">
        <PageTemplateCatalog
          templates={templates}
          onApplyPageTemplate={onApplyPageTemplate}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}