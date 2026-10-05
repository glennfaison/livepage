"use client"

import React from "react"
import { Input } from "@/client/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/client/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { useAppState } from "@/client/features/app-state"
import type { AppNode } from "@/client/features/types"
import { ComponentSettingsTabContent, useComponentSettingsEditor } from "./design-component-settings"
import { DataSourceListViewTabContent, useDataSourceSettingsEditor } from "./data-source-settings"
import { describeTemplateDisplayCatalog, getPageTemplateById, createApplyTemplateActions } from "@/client/features/templates"
import { LayoutTemplate, Search } from "lucide-react"
import { useMemo, useState } from "react"

export function SettingsPopover({
  component,
  children,
}: Readonly<{
  component: AppNode
  children: React.ReactNode
}>): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false)
  const { dispatch } = useAppState()
  const componentSettingsEditor = useComponentSettingsEditor({ component, setIsOpen })
  const dataSourceSettingsEditor = useDataSourceSettingsEditor({ component })
  const { componentInfo, ...componentSettingsTabContent } = componentSettingsEditor

  const templates = useMemo(() => describeTemplateDisplayCatalog(), [])
  const [searchTerm, setSearchTerm] = useState("")
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredTemplates = useMemo(() => {
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-96 p-0 z-50" side="bottom" align="end" sideOffset={8}>
        <div className="bg-background border rounded-lg shadow-lg -m-1 h-[600px] max-h-[600px] overflow-clip flex flex-col">
          <div className="bg-foreground text-background p-3 rounded-t-lg">
            <h2 className="text-sm font-semibold">{componentInfo.label}</h2>
          </div>

          <Tabs defaultValue="settings" className="w-full flex flex-col flex-1 min-h-1">
            <TabsList className="grid w-full grid-cols-3 rounded-none bg-transparent border-b h-auto p-0">
              <TabsTrigger
                data-testid="settings-tab-trigger"
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-muted cursor-pointer"
              >
                Settings
              </TabsTrigger>
              <TabsTrigger
                data-testid="data-sources-tab-trigger"
                value="data-sources"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-muted cursor-pointer"
              >
                Data Sources
              </TabsTrigger>
              <TabsTrigger
                data-testid="templates-tab-trigger"
                value="templates"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-muted cursor-pointer flex items-center gap-1.5"
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
                Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <ComponentSettingsTabContent {...componentSettingsTabContent} />
            </TabsContent>

            <TabsContent value="data-sources" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <DataSourceListViewTabContent {...dataSourceSettingsEditor} />
            </TabsContent>

            <TabsContent value="templates" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <div className="flex flex-col min-h-0 max-h-full">
                <div className="space-y-2 p-3 border-b">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search templates by name, tag, or category"
                      aria-label="Search templates"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredTemplates.length} of {templates.length} templates
                  </p>
                </div>
                <div
                  className="min-h-0 overflow-y-auto overflow-x-hidden pr-1 flex-1"
                  role="region"
                  aria-label="Available templates"
                >
                  <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
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
                  {filteredTemplates.length === 0 && (
                    <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground m-3">
                      No templates match your search.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
}
