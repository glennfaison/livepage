"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { PageTemplateDefinition } from "@/features/templates/schema"
import { LayoutTemplate } from "lucide-react"

export function TemplateCatalogPopover({
  templates,
  onApplyTemplate,
}: Readonly<{
  templates: ReadonlyArray<PageTemplateDefinition>
  onApplyTemplate: (templateId: string) => void
}>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <LayoutTemplate className="h-4 w-4" />
          Templates
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[28rem] p-4">
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Template catalog</h2>
            <p className="text-sm text-muted-foreground">Start from a bundled layout and keep editing with the regular page builder.</p>
          </div>
          <div className="space-y-3">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => onApplyTemplate(template.id)}
                className="w-full rounded-2xl border border-border bg-background p-3 text-left transition-colors hover:bg-muted/40"
              >
                <div className="space-y-3">
                  <div
                    className="aspect-[4/3] rounded-xl border border-border bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${template.metadata.thumbnail})` }}
                    aria-label={`${template.metadata.name} preview`}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-foreground">{template.metadata.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{template.metadata.description}</p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {template.metadata.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {template.metadata.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
