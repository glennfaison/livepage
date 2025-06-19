import { Button } from "@/components/ui/button"
import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { MousePointerClick } from "lucide-react"
import React from "react"
import { withEditorControls } from "./hoc/component-controls-hoc"
import { withTextEditing } from "./hoc/content-editable-hoc"
import { ComponentProps, ComponentTag } from "./types"

export type ComponentAttributes = {
	content: string
}

export const defaultChildren = ["Button"]

export const defaultAttributes: ComponentAttributes = {
	content: "Button",
}

export const tag: ComponentTag = "button" as const

export const label = "Button"

export const keywords = ["button", "click", "action", "btn"]

export const settingsFields = {
	content: {
		id: "content",
		type: "text",
		label: "Content",
		placeholder: "Enter button text",
		propertyPath: "children",
	},
}

export const Icon = <MousePointerClick className="h-4 w-4" />

const Component_ = (props: ComponentProps<typeof tag>) => {
	const children = props.component.children?.length ? props.component.children : defaultChildren
	const filteredProps: Partial<ComponentProps<typeof tag>> = { ...props }
	delete filteredProps.pageBuilderMode
	delete filteredProps.selectedComponentId

	return (
		<Button {...filteredProps}>{children as React.ReactNode}</Button>
	)
}

const WithContentEditing = withTextEditing(Component_)
const ConnectedComponent = withConnection(WithContentEditing)
export const Component = withEditorControls(ConnectedComponent)