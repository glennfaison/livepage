import { withDataSource } from "@/features/design-components/decorators/with-data-source"
import { Type } from "lucide-react"
import React from "react"
import { withEditorControls } from "./decorators/with-editor-controls"
import { withTextEditing } from "./decorators/with-text-editing"
import type { Props, Metadata, Attribute } from "./types"
import { createAttributeMap, createTextAttribute, readTextChildren } from "./shared/component-helpers"

const tag = "inline-text" as const

const label = "Inline Text"

const keywords = ["span", "text", "inline", "content"]

const defaultChildren = ["Inline text."] as const

const attributes: Attribute[] = [
	createTextAttribute({
		id: "id",
		label: "ID",
		placeholder: "ID",
		defaultValue: "",
		readOnly: true,
		disabled: true,
		getValue: (component) => component.attributes.id || "",
		setValue: (component, value) => {
			return { ...component, tag: component.tag ?? tag, attributes: { ...component.attributes, id: value } } as Props["component"]
		},
	}),
	createTextAttribute({
		id: "content",
		label: "Content",
		placeholder: "Enter inline text",
		defaultValue: defaultChildren[0],
		getValue: (component) => readTextChildren(component),
		setValue: (component, value) => {
			return { ...component, children: [value] } as Props["component"]
		},
	}),
]

const attributesMap = createAttributeMap(attributes)

const Icon = <Type className="h-4 w-4" />

const Component = (props: Props) => {
	const children = readTextChildren(props.component) || attributesMap.content.defaultValue
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
