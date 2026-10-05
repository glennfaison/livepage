import { withDataSource } from "@/client/features/data-sources"
import { Type } from "lucide-react"
import React from "react"
import { withEditorControls } from "../editor-controls/decorators/with-editor-controls"
import { withTextEditing } from "../editor-controls/decorators/with-text-editing"
import type { Props, Metadata, SettingsField } from "@/client/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createTextAppearanceAttributes, createTextAttribute, readCustomClasses, readTextAppearance, readTextChildren, getAccessibilityAttributes, getComponentInfo } from "@/client/features/design-components/primitives"
import { cn } from "@/client/lib/utils"

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
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, childClassName, parentTag: ____, component: _____, ...filteredProps } = props
	const metadata = getComponentInfo(props.component.tag)
	const accessibilityAttrs = getAccessibilityAttributes(props.component, metadata)

	return (
		<span className={cn("inline", customClasses, childClassName)} style={textAppearance} {...filteredProps} {...accessibilityAttrs}>{children as React.ReactNode}</span>
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
