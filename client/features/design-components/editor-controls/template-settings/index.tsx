"use client"

import { captureEvent } from "@/client/lib/observability"

import React from "react"
import { useAppState } from "@/client/features/app-state"
import { describePageTemplateDisplayCatalog, getPageTemplateById, type PageTemplateDisplaySummary, type PageTemplateDefinition } from "@/client/features/page-templates/catalog-data"
import type { AppAction, AppNode } from "@/client/features/types"
import { PageTemplateCatalog } from "@/client/features/page-templates/page-template-catalog"

function clonePageTemplatePages(template: PageTemplateDefinition): ReadonlyArray<AppNode> {
  return JSON.parse(JSON.stringify(template.content.pages)) as ReadonlyArray<AppNode>
}

function createApplyPageTemplateActions(
  template: PageTemplateDefinition,
  options: Readonly<{
    customizePages?: (pages: ReadonlyArray<AppNode>) => ReadonlyArray<AppNode>
    historyLabel?: string
  }> = {},
): ReadonlyArray<AppAction> {
  const clonedPages = clonePageTemplatePages(template)
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
        action: options.historyLabel ?? `Applied page template: ${template.metadata.name}`,
        pageState: pages,
      },
    },
  ]
}

export function useTemplateSettingsEditor({
  component: _component,
  setIsOpen,
}: Readonly<{
  component: AppNode
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}>) {
  const { dispatch } = useAppState()

  const templates = React.useMemo(() => describePageTemplateDisplayCatalog(), [])

  const handleApplyTemplate = (templateId: string) => {
    captureEvent("template_applied", { templateId })
    const template = getPageTemplateById(templateId)
    if (!template) return

    for (const action of createApplyPageTemplateActions(template)) {
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
  templates: ReadonlyArray<PageTemplateDisplaySummary>
  handleApplyTemplate: (templateId: string) => void
}>) {
  return (
    <PageTemplateCatalog
      templates={templates}
      onApplyPageTemplate={handleApplyTemplate}
      viewMode="list"
    />
  )
}
