import React from "react"
import { TrendingUp } from "lucide-react"
import { withDataSource } from "@/client/features/data-sources"
import { withEditorControls } from "../editor-controls/decorators/with-editor-controls"
import { withTextEditing } from "../editor-controls/decorators/with-text-editing"
import type { Metadata, Props, SettingsField } from "@/client/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createTextAttribute, readCustomClasses, readTextChildren, getAccessibilityAttributes, getComponentInfo } from "@/client/features/design-components/primitives"
import { cn } from "@/client/lib/utils"

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
  const metadata = getComponentInfo(props.component.tag)
  const accessibilityAttrs = getAccessibilityAttributes(props.component, metadata)
  return <section className={cn("rounded-xl border bg-card p-5 shadow-sm", readCustomClasses(props.component.attributes), props.childClassName)} {...accessibilityAttrs}><p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p><p className="mt-1 text-sm text-muted-foreground">{labelText as React.ReactNode}</p></section>
}

export const componentMetadata = { tag, label, keywords, defaultChildren: ["Monthly visitors"], attributes, Icon, htmlTag: "section", PreviewModeComponent: withDataSource(Component), EditModeComponent: withEditorControls(withTextEditing(withDataSource(Component))) } as const satisfies Metadata
