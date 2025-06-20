import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { Type } from "lucide-react"
import React from "react"
import { withEditorControls } from "./hoc/component-controls-hoc"
import { withTextEditing } from "./hoc/content-editable-hoc"
import { ComponentProps, ComponentTag, DesignComponent } from "./types"

export type ComponentAttributes = object

const defaultChildren = [`
Morbi consequat justo enim, sed accumsan metus blandit eget. Etiam ornare neque
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
sit amet.
`] as const

export const tag: ComponentTag = "paragraph" as const

export const label = "Paragraph"

export const keywords = ["p", "text", "content", "paragraph", "body"]

export const settingsFields = {
	content: {
		id: "content",
		type: "textarea",
		label: "Content",
		placeholder: "Enter paragraph text",
		defaultValue: defaultChildren,
		getValue: (component: DesignComponent<typeof tag>) => component.children,
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, children: Array.isArray(value) ? value : [value], }
		},
	},
}

export const Icon = <Type className="h-4 w-4" />

const Component_ = (props: ComponentProps<typeof tag>) => {
	const children = props.component.children?.length ? props.component.children : settingsFields.content.defaultValue
	const filteredProps: Partial<ComponentProps<typeof tag>> = { ...props }
	delete filteredProps.pageBuilderMode
	delete filteredProps.selectedComponentId

	return (
		<p className="py-2" {...filteredProps}>{children as React.ReactNode}</p>
	)
}

const WithContentEditing = withTextEditing(Component_)
const ConnectedComponent = withConnection(WithContentEditing)
export const Component = withEditorControls(ConnectedComponent)