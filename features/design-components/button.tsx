import { Button } from "@/components/ui/button"
import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { MousePointerClick } from "lucide-react"
import React from "react"
import { withEditorControls } from "./hoc/component-controls-hoc"
import { withTextEditing } from "./hoc/content-editable-hoc"
import { DesignComponentProps, DesignComponentTag, DesignComponent } from "./types"

export type ComponentAttributes = {
	id: string
}

export const tag: DesignComponentTag = "button" as const

export const label = "Button"

export const keywords = ["button", "click", "action", "btn"]

export const defaultChildren = ["Button"] as const

export const settingsFields = {
	id: {
		id: "id",
		type: "text",
		label: "ID",
		readOnly: true,
		disabled: true,
		placeholder: "ID",
		defaultValue: "",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes.id || "",
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, id: value } };
		},
	},
	content: {
		id: "content",
		type: "text",
		label: "Content",
		placeholder: "Enter button text",
		defaultValue: defaultChildren,
		getValue: (component: DesignComponent<typeof tag>) => component.children,
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, children: Array.isArray(value) ? value : [value], }
		},
	},
}

export const Icon = <MousePointerClick className="h-4 w-4" />

const Component_ = (props: DesignComponentProps<typeof tag>) => {
	const children = props.component.children?.length ? props.component.children : settingsFields.content.defaultValue
	const filteredProps: Partial<DesignComponentProps<typeof tag>> = { ...props }
	delete filteredProps.pageBuilderMode
	delete filteredProps.selectedComponentId

	return (
		<Button {...filteredProps}>{children as React.ReactNode}</Button>
	)
}

const WithContentEditing = withTextEditing(Component_)
const ConnectedComponent = withConnection(WithContentEditing)
export const Component = withEditorControls(ConnectedComponent)