"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { PageTemplateDefinition } from "@/features/templates/schema"
import { LayoutTemplate } from "lucide-react"
import { useMemo, useState } from "react"

export function TemplateCatalogPopover({
  templates,
  onApplyTemplate,
}: Readonly<{
  templates: ReadonlyArray<PageTemplateDefinition>
  onApplyTemplate: (templateId: string) => void
}>) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredTemplates = useMemo(() => {
    if (!normalizedSearchTerm) return templates
    return templates.filter((template) => [
      template.metadata.name,
      template.metadata.description,
      template.metadata.category,
      ...template.metadata.tags,
    ].some((value) => value.toLowerCase().includes(normalizedSearchTerm)))
  }, [normalizedSearchTerm, templates])

  const handleApplyTemplate = (templateId: string) => {
    onApplyTemplate(templateId)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <LayoutTemplate className="h-4 w-4" />
          Templates
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(52rem,calc(100vw-2rem))] max-h-[min(80vh,48rem)] overflow-hidden p-4">
        <div className="flex max-h-[calc(min(80vh,48rem)-2rem)] min-h-0 flex-col gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Template catalog</h2>
            <p className="text-sm text-muted-foreground">Choose a starting point tailored to the kind of page you want to build.</p>
          </div>
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search templates by name, tag, or category"
            aria-label="Search templates"
          />
          <div
            className="min-h-0 overflow-y-auto overflow-x-hidden pr-1"
            role="region"
            aria-label="Available templates"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((template) => {
              const primaryTag = template.metadata.tags[0] ?? template.metadata.category

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleApplyTemplate(template.id)}
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
            {filteredTemplates.length === 0 && (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                No templates match your search.
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
