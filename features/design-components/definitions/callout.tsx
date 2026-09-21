import React from "react"
import { Megaphone } from "lucide-react"
import { withDataSource } from "@/features/data-sources/with-data-source"
import { withEditorControls } from "@/features/page-builder/decorators/with-editor-controls"
import { withTextEditing } from "@/features/page-builder/decorators/with-text-editing"
import type { Metadata, Props, SettingsField } from "@/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createSelectAttribute, createTextAttribute, readCustomClasses, readTextChildren } from "@/features/design-component-runtime/shared/component-helpers"
import { cn } from "@/lib/utils"

const tag = "callout" as const
const label = "Callout"
const keywords = ["callout", "alert", "notice", "announcement", "info"]
const attributes: SettingsField[] = [
  createIdAttribute(),
  createCustomClassesAttribute(),
  createTextAttribute({ id: "content", label: "Content", placeholder: "Enter callout text", defaultValue: "Share an important update.", getValue: readTextChildren, setValue: (component, value) => ({ ...component, children: [value] } as Props["component"]) }),
  createSelectAttribute({ id: "tone", label: "Tone", options: ["neutral", "info", "success", "warning"], defaultValue: "neutral" }),
]
const attributesMap = createAttributeMap(attributes)
const Icon = <Megaphone className="size-4" />
const tones = {
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-100 text-amber-900",
}

const Component = (props: Props) => {
  const content = readTextChildren(props.component) || attributesMap.content.defaultValue
  const tone = String(props.component.attributes.tone || "neutral") as keyof typeof tones
  return <aside className={cn("flex items-start gap-3 rounded-lg border px-4 py-3 text-sm leading-6", tones[tone] || tones.neutral, readCustomClasses(props.component.attributes), props.childClassName)} role="note"><Megaphone className="mt-1 size-4 shrink-0" aria-hidden="true" /><span>{content as React.ReactNode}</span></aside>
}

export const componentMetadata = { tag, label, keywords, defaultChildren: ["Share an important update."], attributes, Icon, htmlTag: "aside", PreviewModeComponent: withDataSource(Component), EditModeComponent: withEditorControls(withTextEditing(withDataSource(Component))) } as const satisfies Metadata
