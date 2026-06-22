"use client"

import React from "react"
import { withDataSource } from "@/features/design-components/decorators/with-data-source"
import { ImageIcon } from "lucide-react"
import { withEditorControls } from "./decorators/with-editor-controls"
import type { Props, Attribute, Metadata } from "./types"

const tag = "image" as const

const label = "Image"

const keywords = ["image", "picture", "photo", "graphic", "media"]

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
		id: "src",
		type: "text",
		label: "Image Source",
		placeholder: "Enter image URL",
		defaultValue: "",
		getValue: (component) => component.attributes.src,
		setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, src: value } } as Props["component"]),
	},
	{
		id: "alt",
		type: "text",
		label: "Alt Text",
		placeholder: "Enter image description",
		defaultValue: "Image Description",
		getValue: (component) => component.attributes.alt,
		setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, alt: value } } as Props["component"]),
	},
	{
		id: "width",
		type: "text",
		label: "Width",
		placeholder: "Enter width (e.g., 100px, 50%)",
		defaultValue: "100%",
		getValue: (component) => component.attributes.width,
		setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, width: value } } as Props["component"]),
	},
	{
		id: "height",
		type: "text",
		label: "Height",
		placeholder: "Enter height (e.g., 100px, auto)",
		defaultValue: "auto",
		getValue: (component) => component.attributes.height,
		setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, height: value } } as Props["component"]),
	},
	{
		id: "fallbackSrc",
		type: "text",
		label: "Fallback Image Source",
		placeholder: "Enter fallback image URL",
		defaultValue: "/placeholder-img.svg?height=300&width=300",
		getValue: (component) => component.attributes.fallbackSrc,
		setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, fallbackSrc: value } } as Props["component"]),
	},
]

const Icon = <ImageIcon className="h-4 w-4" />

const Component = (props: Props) => {
	const { src, alt, fallbackSrc, ...restAttributes } = props.component.attributes

	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={src || fallbackSrc}
			alt={alt}
			className="max-w-full h-auto"
			{...restAttributes}
		/>
	)
}

export const componentMetadata = {
	tag,
	label,
	keywords,
	defaultChildren: [],
	attributes,
	Icon,
	ViewModeComponent: withDataSource(Component),
	EditModeComponent: withEditorControls(withDataSource(Component)),
} as const satisfies Metadata