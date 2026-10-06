"use client"

import React from "react"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Grid, List, Search } from "lucide-react"
import { useAppState } from "@/client/features/app-state"
import { describeTemplateDisplayCatalog, getPageTemplateById, type TemplateDisplaySummary, type PageTemplateDefinition } from "@/client/features/templates/catalog-data"
import type { AppAction, AppNode } from "@/client/features/types"

function cloneTemplatePages(template: PageTemplateDefinition): ReadonlyArray<AppNode> {
  return JSON.parse(JSON.stringify(template.content.pages)) as ReadonlyArray<AppNode>
}

function createApplyTemplateActions(
  template: PageTemplateDefinition,
  options: Readonly<{
    customizePages?: (pages: ReadonlyArray<AppNode>) => ReadonlyArray<AppNode>
    historyLabel?: string
  }> = {},
): ReadonlyArray<AppAction> {
  const clonedPages = cloneTemplatePages(template)
  const pages = options.customizePages ? options.customizePages(clonedPages) : clonedPages
  const activePageId = pages[0]?.attributes.id ?? ""

  return [
    { type: "SET_PAGES", payload: pages },
    { type: "SET_ACTIVE_PAGE", payload: activePageId },
    { type: "SET_SELECTED_COMPONENT", payload: "" },
    { type: "SET_SELECTED_COMPONENT_ANCESTORS", payload: "" },
    {
      type: "ADD_TO_HISTORY",
      payload: {
        action: options.historyLabel ?? `Applied template: ${template.metadata.name}`,
        pageState: pages,
      },
    },
  ]
}

export function useTemplateSettingsEditor({
  component,
  setIsOpen,
}: Readonly<{
  component: AppNode
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}>) {
  const { dispatch } = useAppState()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list")
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()

  const templates = React.useMemo(() => describeTemplateDisplayCatalog(), [])

  const filteredTemplates = React.useMemo(() => {
    if (!normalizedSearchTerm) return templates
    return templates.filter((template) => [
      template.name,
      template.description,
      template.category,
      ...template.tags,
    ].some((value) => value.toLowerCase().includes(normalizedSearchTerm)))
  }, [normalizedSearchTerm, templates])

  const handleApplyTemplate = (templateId: string) => {
    const template = getPageTemplateById(templateId)
    if (!template) return

    for (const action of createApplyTemplateActions(template)) {
      dispatch(action)
    }
    setIsOpen(false)
  }

  return {
    searchTerm,
    setSearchTerm,
    filteredTemplates,
    viewMode,
    setViewMode,
    handleApplyTemplate,
  }
}

export function TemplateTabContent({
  searchTerm,
  setSearchTerm,
  filteredTemplates,
  viewMode,
  setViewMode,
  handleApplyTemplate,
}: Readonly<{
  searchTerm: string
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
  filteredTemplates: ReadonlyArray<TemplateDisplaySummary>
  viewMode: "grid" | "list"
  setViewMode: React.Dispatch<React.SetStateAction<"grid" | "list">>
  handleApplyTemplate: (templateId: string) => void
}>) {
  return (
    <div className="flex flex-col flex-1 min-h-1 overflow-clip">
      <div className="p-4 space-y-4">
        <div className="space-y-1.5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Template catalog</h2>
          <p className="text-sm text-muted-foreground">Choose a starting point tailored to the kind of page you want to build.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search templates by name, tag, or category"
            aria-label="Search templates"
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 self-end">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            aria-label="List view"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            aria-label="Grid view"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
        <div
          className="min-h-0 overflow-y-auto overflow-x-hidden pr-1 flex-1"
          role="region"
          aria-label="Available templates"
        >
          {viewMode === "list" ? (
            <div className="space-y-2">
              {filteredTemplates.map((template) => {
                const primaryTag = template.tags[0] ?? template.category

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleApplyTemplate(template.id)}
                    aria-label={`Apply ${template.name} template`}
                    className="group w-full rounded-xl border border-border bg-background p-3 text-left transition-all duration-150 hover:border-foreground/20 hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center gap-4"
                  >
                    <div
                      className="aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-cover bg-center bg-no-repeat shadow-sm flex-shrink-0"
                      style={{ backgroundImage: `url(${template.thumbnail})` }}
                      aria-label={`${template.name} preview`}
                    />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {template.category}
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
                          Best for {primaryTag}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground truncate">{template.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{template.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map((template) => {
                const primaryTag = template.tags[0] ?? template.category

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleApplyTemplate(template.id)}
                    aria-label={`Apply ${template.name} template`}
                    className="group w-full rounded-2xl border border-border bg-background p-3 text-left transition-all duration-150 hover:border-foreground/20 hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="space-y-3">
                      <div
                        className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-cover bg-center bg-no-repeat shadow-sm"
                        style={{ backgroundImage: `url(${template.thumbnail})` }}
                        aria-label={`${template.name} preview`}
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                              {template.category}
                            </span>
                            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
                              Best for {primaryTag}
                            </span>
                          </div>
                          <h3 className="font-medium text-foreground">{template.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {template.tags.slice(0, 3).map((tag) => (
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
          )}
          {filteredTemplates.length === 0 && (
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              No templates match your search.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}