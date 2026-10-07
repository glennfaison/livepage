"use client"

import React from "react"
import { useAppState } from "@/client/features/app-state"
import { describeTemplateDisplayCatalog, getPageTemplateById, type TemplateDisplaySummary, type PageTemplateDefinition } from "@/client/features/templates/catalog-data"
import type { AppAction, AppNode } from "@/client/features/types"
import { TemplateCatalog } from "@/client/features/templates/template-catalog"

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

  const templates = React.useMemo(() => describeTemplateDisplayCatalog(), [])

  const handleApplyTemplate = (templateId: string) => {
    const template = getPageTemplateById(templateId)
    if (!template) return

    for (const action of createApplyTemplateActions(template)) {
      dispatch(action)
    }
    setIsOpen(false)
  }

  return {
    templates,
    handleApplyTemplate,
  }
}

export function TemplateTabContent({
  templates,
  handleApplyTemplate,
}: Readonly<{
  templates: ReadonlyArray<TemplateDisplaySummary>
  handleApplyTemplate: (templateId: string) => void
}>) {
  return (
    <TemplateCatalog
      templates={templates}
      onApplyTemplate={handleApplyTemplate}
      viewMode="list"
    />
  )
}
