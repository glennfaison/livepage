import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { Type } from "lucide-react"
import React from "react"
import { withEditorControls } from "./hoc/component-controls-hoc"
import { withTextEditing } from "./hoc/content-editable-hoc"
import type { Props, Attribute, Metadata } from "./types"

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

const attributes: Attribute[] = [
	{
		id: "id",
		type: "text",
		label: "ID",
		readOnly: true,
		disabled: true,
		placeholder: "ID",
		defaultValue: "",
		getValue: (component) => component.attributes.id || "",
		setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, id: value } } as Props["component"]),
	},
	{
		id: "content",
		type: "textarea",
		label: "Content",
		placeholder: "Enter paragraph text",
		defaultValue: "",
		getValue: (component) => component.children,
		setValue: (component, value: unknown) => ({ ...component, children: Array.isArray(value) ? value : [value] } as Props["component"]),
	},
]

const attributesMap = Object.fromEntries((attributes).map((s) => [s.id, s]))

const Icon = <Type className="h-4 w-4" />

const Component = (props: Props) => {
	const children = props.component.children?.length ? props.component.children : attributesMap.content.defaultValue
	const filteredProps: Partial<Props> = { ...props }
	delete (filteredProps as any).pageBuilderMode
	delete filteredProps.selectedComponentId

	return (
		<p className="py-2" {...filteredProps}>{children as React.ReactNode}</p>
	)
}

const WithContentEditing = withTextEditing(Component)
const ViewModeComponent = withConnection(WithContentEditing)
const EditModeComponent = withEditorControls(ViewModeComponent)

export const metadata: Metadata = {
	tag,
	label,
	keywords,
	defaultChildren,
	attributes,
	Icon,
	ViewModeComponent,
	EditModeComponent,
}