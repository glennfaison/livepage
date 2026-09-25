import { withDataSource } from "@/features/data-sources"
import { Type } from "lucide-react"
import React from "react"
import { withEditorControls, withTextEditing } from "@/features/page-builder/editor-controls"
import type { Props, Metadata, SettingsField } from "@/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createTextAppearanceAttributes, createTextAttribute, readCustomClasses, readTextAppearance, readTextChildren } from "@/features/design-component-runtime/primitives"
import { cn } from "@/lib/utils"

const tag = "inline-text" as const

const label = "Inline Text"

const keywords = ["span", "text", "inline", "content"]

const defaultChildren = ["Inline text."] as const

const attributes: SettingsField[] = [
	createIdAttribute({
		getValue: (component) => component.attributes.id || "",
		setValue: (component, value) => {
			return { ...component, tag: component.tag ?? tag, attributes: { ...component.attributes, id: value } } as Props["component"]
		},
	}),
	createCustomClassesAttribute(),
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
	createTextAppearanceAttributes(),
]

const attributesMap = createAttributeMap(attributes)

const Icon = <Type className="h-4 w-4" />

const Component = (props: Props) => {
	const children = readTextChildren(props.component) || attributesMap.content.defaultValue
	const customClasses = readCustomClasses(props.component.attributes)
	const textAppearance = readTextAppearance(props.component.attributes)
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, childClassName, ...filteredProps } = props

	return (
		<span className={cn("inline", customClasses, childClassName)} style={textAppearance} {...filteredProps}>{children as React.ReactNode}</span>
	)
}

export const componentMetadata = {
	tag,
	htmlTag: "span",
	label,
	keywords,
	defaultChildren,
	attributes,
	Icon,
	PreviewModeComponent: withDataSource(Component),
	EditModeComponent: withEditorControls(withTextEditing(withDataSource(Component))),
} as const satisfies Metadata
