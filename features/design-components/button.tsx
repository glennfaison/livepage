import { MousePointerClick } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ComponentProps, ComponentTag } from "./types"
import React from "react"
import { withTextEditing } from "./hoc/content-editable-hoc"
import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { withEditorControls } from "./hoc/component-controls-hoc"

export type ComponentAttributes = {
	content: string
}

const defaultChildren = ["Button"]

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
	},
}

export const Icon = <MousePointerClick className="h-4 w-4" />

const Component_ = (props: ComponentProps<typeof tag>) => {
	const children = props.component.children?.length ? props.component.children : defaultChildren
	return (
		<Button {...props}>{children as React.ReactNode}</Button>
	)
}

const WithContentEditing = withTextEditing(Component_)
const ConnectedComponent = withConnection(WithContentEditing)
export const Component = withEditorControls(ConnectedComponent)