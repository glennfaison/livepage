import React from "react"
import { TrendingUp } from "lucide-react"
import { withDataSource } from "@/features/data-sources/with-data-source"
import { withEditorControls, withTextEditing } from "@/features/page-builder/editor-controls"
import type { Metadata, Props, SettingsField } from "@/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createTextAttribute, readCustomClasses, readTextChildren } from "@/features/design-component-runtime/primitives"
import { cn } from "@/lib/utils"

const tag = "stat" as const
const label = "Stat"
const keywords = ["stat", "metric", "number", "kpi", "data"]
const attributes: SettingsField[] = [
  createIdAttribute(),
  createCustomClassesAttribute(),
  createTextAttribute({ id: "value", label: "Value", placeholder: "Enter value", defaultValue: "24.8K", getValue: (component) => String(component.attributes.value || ""), setValue: (component, value) => ({ ...component, attributes: { ...component.attributes, value } } as Props["component"]) }),
  createTextAttribute({ id: "label", label: "Label", placeholder: "Enter label", defaultValue: "Monthly visitors", getValue: readTextChildren, setValue: (component, value) => ({ ...component, children: [value] } as Props["component"]) }),
]
const attributesMap = createAttributeMap(attributes)
const Icon = <TrendingUp className="size-4" />

const Component = (props: Props) => {
  const value = String(props.component.attributes.value || attributesMap.value.defaultValue)
  const labelText = readTextChildren(props.component) || attributesMap.label.defaultValue
  return <section className={cn("rounded-xl border bg-card p-5 shadow-sm", readCustomClasses(props.component.attributes), props.childClassName)} aria-label={String(labelText)}><p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p><p className="mt-1 text-sm text-muted-foreground">{labelText as React.ReactNode}</p></section>
}

export const componentMetadata = { tag, label, keywords, defaultChildren: ["Monthly visitors"], attributes, Icon, htmlTag: "section", PreviewModeComponent: withDataSource(Component), EditModeComponent: withEditorControls(withTextEditing(withDataSource(Component))) } as const satisfies Metadata
