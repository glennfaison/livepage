import { withDataSource } from "@/client/features/data-sources"
import { Heading } from "lucide-react"
import React from "react"
import { withEditorControls } from "../editor-controls/decorators/with-editor-controls"
import { withTextEditing } from "../editor-controls/decorators/with-text-editing"
import type { Props, SettingsField, Metadata } from "@/client/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createTextAppearanceAttributes, createTextAttribute, readCustomClasses, readTextAppearance, readTextChildren, getAccessibilityAttributes, getComponentInfo } from "@/client/features/design-components/primitives"
import { cn } from "@/client/lib/utils"

const tag = "header3" as const

const label = "Header 3"

const keywords = ["h3", "title", "subtitle", "subheading", "header", "heading", "small"]

const defaultChildren = ["Header 3"] as const

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
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, childClassName, parentTag: ____, component: _____, ...filteredProps } = props
	const metadata = getComponentInfo(props.component.tag)
	const accessibilityAttrs = getAccessibilityAttributes(props.component, metadata)

	return (
		<h3 className={cn("text-2xl font-bold py-2", customClasses, childClassName)} style={textAppearance} {...filteredProps} {...accessibilityAttrs}>{children as React.ReactNode}</h3>
	)
}

export const componentMetadata = {
	tag,
	htmlTag: "h3",
	label,
	keywords,
	defaultChildren,
	attributes,
	Icon,
	category: "Typography",
	PreviewModeComponent: withDataSource(Component),
	EditModeComponent: withEditorControls(withTextEditing(withDataSource(Component))),
} as const satisfies Metadata
