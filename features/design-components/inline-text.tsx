import { withDataSource } from "@/features/design-components/decorators/with-data-source"
import { Type } from "lucide-react"
import React from "react"
import { withEditorControls } from "./decorators/with-editor-controls"
import { withTextEditing } from "./decorators/with-text-editing"
import type { Props, Metadata, Attribute } from "./types"

export type ComponentAttributes = {
	id: string
}

export const tag = "inline-text" as const

const label = "Inline Text"

const keywords = ["span", "text", "inline", "content"]

const defaultChildren = ["Inline text."] as const

const attributes = [
	{
		id: "id",
		type: "text",
		label: "ID",
		readOnly: true,
		disabled: true,
		placeholder: "ID",
		defaultValue: "",
		getValue: (component) => component.attributes.id || "",
		setValue: (component, value) => {
			return { ...component, tag: component.tag ?? tag, attributes: { ...component.attributes, id: value } } as Props["component"]
		},
	},
	{
		id: "content",
		type: "text",
		label: "Content",
		placeholder: "Enter inline text",
		defaultValue: defaultChildren[0],
		getValue: (component) => {
			if (!component.children) return ""
			if (Array.isArray(component.children)) {
				return component.children.map(child => typeof child === "string" ? child : "").join("")
			}
			return typeof component.children === "string" ? component.children : ""
		},
		setValue: (component, value) => {
			return { ...component, children: Array.isArray(value) ? value : [value], } as Props["component"]
		},
	},
] as const satisfies Attribute[]

const attributesMap = Object.fromEntries((attributes).map((s) => [s.id, s]))

const Icon = <Type className="h-4 w-4" />

const Component = (props: Props) => {
	const children = props.component.children?.length ? props.component.children : attributesMap.content.defaultValue
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, ...filteredProps } = props

	return (
		<span className="inline" {...filteredProps}>{children as React.ReactNode}</span>
	)
}

export const componentMetadata = {
	tag,
	label,
	keywords,
	defaultChildren,
	attributes,
	Icon,
	ViewModeComponent: withDataSource(Component),
	EditModeComponent: withEditorControls(withTextEditing(withDataSource(Component))),
} as const satisfies Metadata