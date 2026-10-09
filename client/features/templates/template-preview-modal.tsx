"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/components/ui/dialog"
import { Button } from "@/client/components/ui/button"
import { CanvasRenderer } from "@/client/features/page-builder/canvas-renderer"
import type { AppNode } from "@/client/features/types"
import { getPageTemplateById, type PageTemplateDefinition } from "./catalog-data"
import { X, Maximize, Minimize, ExternalLink } from "lucide-react"

// Import from ./catalog-data (a leaf module) rather than the templates
// barrel: the barrel pulls in ./registry -> ./schema -> serializers ->
// design-components, which is mid-initialization when this module is
// reached from the design-components subtree (template-settings ->
// template-catalog -> here), causing a circular-import TDZ error.
function cloneTemplatePages(template: PageTemplateDefinition): ReadonlyArray<AppNode> {
  return JSON.parse(JSON.stringify(template.content.pages))
}

interface TemplatePreviewModalProps {
  templateId: string
  isOpen: boolean
  onClose: () => void
  onApplyTemplate: (templateId: string) => void
}

export function TemplatePreviewModal({ templateId, isOpen, onClose, onApplyTemplate }: Readonly<TemplatePreviewModalProps>) {
  const template = getPageTemplateById(templateId)
  const [isMaximized, setIsMaximized] = React.useState(false)

  if (!template) {
    return null
  }

  const pages = cloneTemplatePages(template)
  const activePage = pages[0]

  const handleApply = () => {
    onApplyTemplate(templateId)
    onClose()
  }

  const handleOpenInNewTab = () => {
    const url = new URL(window.location.origin + "/try")
    url.searchParams.set("template", templateId)
    url.searchParams.set("mode", "preview")
    window.open(url.toString(), "_blank")
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`
          flex flex-col max-h-[95vh] max-w-[95vw]
          ${isMaximized ? "h-[95vh] w-[95vw]" : "h-[80vh] w-[80vw]"}
        `}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg font-semibold">{template.metadata.name}</DialogTitle>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {template.metadata.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMaximized(!isMaximized)}
              aria-label={isMaximized ? "Minimize preview" : "Maximize preview"}
              title={isMaximized ? "Minimize preview" : "Maximize preview"}
            >
              {isMaximized ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenInNewTab}
              aria-label="Open preview in new tab"
              title="Open preview in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close preview">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          {activePage && (
            <div className="bg-white rounded-lg shadow-sm border min-h-[400px]">
              <CanvasRenderer
                component={activePage}
                pageBuilderMode="preview"
                selectedComponentId=""
                selectedComponentAncestors={[]}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={handleOpenInNewTab}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          <Button onClick={handleApply}>
            Apply Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}