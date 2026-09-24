import { withDataSource } from "@/features/data-sources/with-data-source"
import { Heading } from "lucide-react"
import React from "react"
import { withEditorControls, withTextEditing } from "@/features/page-builder/editor-controls"
import type { Props, SettingsField, Metadata } from "@/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createTextAppearanceAttributes, createTextAttribute, readCustomClasses, readTextAppearance, readTextChildren } from "@/features/design-component-runtime/shared/component-helpers"
import { cn } from "@/lib/utils"

const tag = "header1" as const

const label = "Header 1"

const keywords = ["h1", "title", "header", "heading", "large"]

const defaultChildren = ["Header 1"] as const

const attributes: SettingsField[] = [
	createIdAttribute(),
	createCustomClassesAttribute(),
	createTextAttribute({
		id: "content",
		label: "Content",
		placeholder: "Enter header text",
		defaultValue: "",
		getValue: (component) => readTextChildren(component),
		setValue: (component, value) => ({ ...component, children: [value] } as Props["component"]),
	}),
	createTextAppearanceAttributes(),
]

const attributesMap = createAttributeMap(attributes)

const Icon = <Heading className="h-4 w-4" />

const Component = (props: Props) => {
	const children = readTextChildren(props.component) || attributesMap.content.defaultValue
	const customClasses = readCustomClasses(props.component.attributes)
	const textAppearance = readTextAppearance(props.component.attributes)
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, childClassName, ...filteredProps } = props

	return (
		<h1 className={cn("text-4xl font-bold py-2", customClasses, childClassName)} style={textAppearance} {...filteredProps}>{children as React.ReactNode}</h1>
	)
}

export const componentMetadata = {
	tag,
	htmlTag: "h1",
	label,
	keywords,
	defaultChildren,
	attributes,
	Icon,
	PreviewModeComponent: withDataSource(Component),
	EditModeComponent: withEditorControls(withTextEditing(withDataSource(Component))),
} as const satisfies Metadata
