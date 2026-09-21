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
        <div className="space-y-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Template catalog</h2>
            <p className="text-sm text-muted-foreground">Choose a starting point tailored to the kind of page you want to build.</p>
          </div>
          <div className="space-y-3">
            {templates.map((template) => {
              const primaryTag = template.metadata.tags[0] ?? template.metadata.category

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onApplyTemplate(template.id)}
                  aria-label={`Apply ${template.metadata.name} template`}
                  className="group w-full rounded-2xl border border-border bg-background p-3 text-left transition-all duration-150 hover:border-foreground/20 hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="space-y-3">
                    <div
                      className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-cover bg-center bg-no-repeat shadow-sm"
                      style={{ backgroundImage: `url(${template.metadata.thumbnail})` }}
                      aria-label={`${template.metadata.name} preview`}
                    />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {template.metadata.category}
                          </span>
                          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
                            Best for {primaryTag}
                          </span>
                        </div>
                        <h3 className="font-medium text-foreground">{template.metadata.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{template.metadata.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {template.metadata.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
