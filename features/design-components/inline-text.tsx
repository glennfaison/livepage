import { Type } from "lucide-react"
import { ComponentProps, ComponentTag } from "./types"
import { withTextEditing } from "./content-editable-hoc"
import React from "react"

export type ComponentAttributes = {
	content: string
}

export const defaultAttributes: ComponentAttributes = {
	content: "Inline text.",
}

export const tag: ComponentTag = "inline-text" as const

export const label = "Inline Text"

export const keywords = ["span", "text", "inline", "content"]

export const settingsFields = {
	content: {
		id: "content",
		type: "text",
		label: "Content",
		placeholder: "Enter inline text",
	},
}

export const Icon = <Type className="h-4 w-4" />

export const Component = withTextEditing((props: ComponentProps<typeof tag>) => {
	const { content } = props.attributes
	return (
		<span className="inline" {...props}>{content}</span>
	)
})