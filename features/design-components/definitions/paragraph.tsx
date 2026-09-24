import { withDataSource } from "@/features/data-sources/with-data-source"
import { Type } from "lucide-react"
import React from "react"
import { withEditorControls, withTextEditing } from "@/features/page-builder/editor-controls"
import type { Props, Metadata, SettingsField } from "@/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createTextAppearanceAttributes, createTextAttribute, createTextareaAttribute, readCustomClasses, readTextAppearance, readTextArrayChildren } from "@/features/design-component-runtime/shared/component-helpers"
import { cn } from "@/lib/utils"

const defaultChildren = [
	`Morbi consequat justo enim, sed accumsan metus blandit eget. Etiam ornare neque
	sagittis metus hendrerit tincidunt. Sed sed vulputate quam. Vivamus rutrum elit
	quis mauris aliquet dictum. Praesent iaculis ornare posuere. Sed pretium sed
	mauris non mollis. Pellentesque sem purus, sagittis sed odio commodo, faucibus
	vehicula elit. Mauris vestibulum euismod mi, feugiat accumsan mauris imperdiet
	eget. Ut sit amet dolor mattis, consectetur est id, placerat tellus. Proin nisl
	odio, elementum sed porttitor ut, tempus non neque. In hac habitasse platea
	dictumst. Proin at lorem lacinia, ullamcorper lorem eget, fringilla massa.
	Suspendisse consequat, lectus sit amet congue tincidunt, neque felis
	pellentesque nulla, ac pharetra lectus elit eget neque. Sed feugiat tincidunt
	leo, ac pretium metus. In suscipit iaculis mi, sit amet euismod justo posuere
	sit amet.`
] as const

const tag = "paragraph" as const

const label = "Paragraph"

const keywords = ["p", "text", "content", "paragraph", "body"]

const attributes: SettingsField[] = [
	createIdAttribute(),
	createCustomClassesAttribute(),
	createTextareaAttribute({
		id: "content",
		label: "Content",
		placeholder: "Enter paragraph text",
		defaultValue: [],
		getValue: (component) => readTextArrayChildren(component),
		setValue: (component, value) => ({ ...component, children: [...value] } as Props["component"]),
	}),
	createTextAppearanceAttributes(),
]

const attributesMap = createAttributeMap(attributes)

const Icon = <Type className="h-4 w-4" />

const Component = (props: Props) => {
	const children = readTextArrayChildren(props.component)
	const renderedChildren = children.length ? children : (attributesMap.content.defaultValue as readonly string[])
	const customClasses = readCustomClasses(props.component.attributes)
	const textAppearance = readTextAppearance(props.component.attributes)
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, childClassName, ...filteredProps } = props

	return <p className={cn(renderedChildren.length > 0 && "py-2", customClasses, childClassName)} style={textAppearance} {...filteredProps}>{renderedChildren as React.ReactNode}</p>
}

export const componentMetadata = {
	tag,
	htmlTag: "p",
	label,
	keywords,
	defaultChildren,
	attributes,
	Icon,
	PreviewModeComponent: withDataSource(Component),
	EditModeComponent: withEditorControls(withTextEditing(withDataSource(Component))),
} as const satisfies Metadata
