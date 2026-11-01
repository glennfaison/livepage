"use client"

import React from "react"
import { captureEvent } from "@/client/lib/observability"
import { Button } from "@/client/components/ui/button"
import { useAppState } from "@/client/features/app-state"
import { getComponentTemplatesAllowedIn, type ComponentTemplateDisplaySummary } from "@/client/features/templates/component-registry"
import { createApplyComponentTemplateActions } from "@/client/features/templates/component-actions"
import type { AppNode } from "@/client/features/types"

export function useComponentTemplateSettingsEditor({
  component,
  setIsOpen,
}: Readonly<{
  component: AppNode
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}>) {
  const { dispatch, state } = useAppState()

  const parentTag = state.selectedComponentAncestors.at(-1)?.tag
  const allowedTemplates = React.useMemo(
    () => getComponentTemplatesAllowedIn(parentTag),
    [parentTag],
  )

  const templates = React.useMemo(
    () =>
      allowedTemplates.map((template) => ({
        id: template.id,
        name: template.metadata.name,
        description: template.metadata.description,
        category: template.metadata.category,
        tags: template.metadata.tags,
        thumbnail: template.metadata.thumbnail,
        rootTag: template.content.root.tag,
      })),
    [allowedTemplates],
  )

  const templateById = React.useMemo(
    () => new Map(allowedTemplates.map((template) => [template.id, template])),
    [allowedTemplates],
  )

  const handleApplyTemplate = React.useCallback(
    (templateId: string) => {
      const template = templateById.get(templateId)
      if (!template) return
      captureEvent("component_template_applied", { templateId })
      for (const action of createApplyComponentTemplateActions(template, {
        componentId: component.attributes.id,
      })) {
        dispatch(action)
      }
      setIsOpen(false)
    },
    [component.attributes.id, dispatch, setIsOpen, templateById],
  )

  return { templates, handleApplyTemplate }
}

function ComponentTemplateCard({
  template,
  onApply,
}: Readonly<{
  template: ComponentTemplateDisplaySummary
  onApply: (templateId: string) => void
}>): React.JSX.Element {
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-border bg-background p-3 transition-colors hover:border-foreground/20 hover:bg-muted/35">
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">{template.category}</div>
        <span className="ml-auto text-[10px] text-muted-foreground">{template.rootTag}</span>
      </div>
      <h3 className="font-medium text-foreground">{template.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {template.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
      <Button onClick={() => onApply(template.id)} className="w-full mt-auto">
        Apply {template.name}
      </Button>
    </div>
  )
}

export function ComponentTemplatesTabContent({
  templates,
  handleApplyTemplate,
}: Readonly<{
  templates: ReadonlyArray<{
    id: string
    name: string
    description: string
    category: string
    tags: ReadonlyArray<string>
    thumbnail: string
    rootTag: string
  }>
  handleApplyTemplate: (templateId: string) => void
}>): React.JSX.Element {
  return (
    <div className="space-y-4 p-4 overflow-y-scroll flex-1 min-h-0">
      <div className="space-y-1.5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Component templates</h2>
        <p className="text-sm text-muted-foreground">
          Replace the selected component with a pre-built block. The replaced content is discarded; undo restores it.
        </p>
      </div>

      {templates.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No component templates fit inside the selected component&apos;s parent slot.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3">
          {templates.map((template) => (
            <ComponentTemplateCard key={template.id} template={template} onApply={handleApplyTemplate} />
          ))}
        </div>
      )}
    </div>
  )
}
