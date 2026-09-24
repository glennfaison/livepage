import React from "react"
import { Tag } from "lucide-react"
import { withDataSource } from "@/features/data-sources/with-data-source"
import { withEditorControls, withTextEditing } from "@/features/page-builder/editor-controls"
import type { Metadata, Props, SettingsField } from "@/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createSelectAttribute, createTextAttribute, readCustomClasses, readTextChildren } from "@/features/design-component-runtime/primitives"
import { cn } from "@/lib/utils"

const tag = "badge" as const
const label = "Badge"
const keywords = ["badge", "tag", "label", "status", "pill"]
const variants = ["default", "secondary", "outline", "success", "warning"] as const
const attributes: SettingsField[] = [
  createIdAttribute(),
  createCustomClassesAttribute(),
  createTextAttribute({ id: "content", label: "Content", placeholder: "Enter badge text", defaultValue: "New", getValue: readTextChildren, setValue: (component, value) => ({ ...component, children: [value] } as Props["component"]) }),
  createSelectAttribute({ id: "variant", label: "Style", options: variants, defaultValue: "default" }),
]
const attributesMap = createAttributeMap(attributes)
const Icon = <Tag className="h-4 w-4" />

const Component = (props: Props) => {
  const content = readTextChildren(props.component) || attributesMap.content.defaultValue
  const variant = props.component.attributes.variant || "default"
  const customClasses = readCustomClasses(props.component.attributes)
  const variantClasses = {
    default: "bg-slate-900 text-white",
    secondary: "bg-slate-200 text-slate-700",
    outline: "border border-slate-300 bg-white text-slate-700",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-900",
  }[variant] || "bg-slate-900 text-white"
  return <span className={cn("inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium", variantClasses, customClasses, props.childClassName)}>{content as React.ReactNode}</span>
}

export const componentMetadata = {
  tag, label, keywords, defaultChildren: ["New"], attributes, Icon, htmlTag: "span",
  PreviewModeComponent: withDataSource(Component),
  EditModeComponent: withEditorControls(withTextEditing(withDataSource(Component))),
} as const satisfies Metadata

