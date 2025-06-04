import { MousePointerClick } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ComponentProps, ComponentTag } from "./types"
import React from "react"
import { withTextEditing } from "./content-editable-hoc"

export type ComponentAttributes = {
	content: string
}

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

export const Component = withTextEditing((props: ComponentProps<typeof tag>) => {
	const { content } = props.attributes
	return (
		<Button {...props}>{content}</Button>
	)
})