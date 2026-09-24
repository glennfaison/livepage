"use client"

import React from "react"
import { withDataSource } from "@/features/data-sources/with-data-source"
import { ImageIcon } from "lucide-react"
import { withEditorControls } from "@/features/page-builder/editor-controls"
import type { Props, SettingsField, Metadata } from "@/features/types"
import { cn } from "@/lib/utils"
import { createColorAttribute, createCustomClassesAttribute, createGroupAttribute, createIdAttribute, createSelectAttribute, readCustomClasses } from "@/features/design-component-runtime/shared/component-helpers"

const tag = "image" as const

const label = "Image"

const keywords = ["image", "picture", "photo", "graphic", "media"]

const attributes: SettingsField[] = [
	createIdAttribute(),
	createCustomClassesAttribute(),
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
	createGroupAttribute({
		id: "presentation",
		label: "Presentation",
		collapsible: true,
		fields: [
			createSelectAttribute({
				id: "objectFit",
				label: "Object Fit",
				options: ["fill", "contain", "cover", "none", "scale-down"],
				defaultValue: "contain",
				getValue: (component) => component.attributes.objectFit || "contain",
				setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, objectFit: value } } as Props["component"]),
			}),
			{
				id: "objectPosition",
				type: "text",
				label: "Object Position",
				placeholder: "e.g., center, top right",
				defaultValue: "center",
				getValue: (component) => component.attributes.objectPosition || "center",
				setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, objectPosition: value } } as Props["component"]),
			},
			{
				id: "borderRadius",
				type: "text",
				label: "Corner Radius",
				placeholder: "e.g., 8px or 50%",
				defaultValue: "0",
				getValue: (component) => component.attributes.borderRadius || "0",
				setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, borderRadius: value } } as Props["component"]),
			},
			{
				id: "opacity",
				type: "number",
				label: "Opacity",
				min: 0,
				max: 1,
				step: 0.1,
				defaultValue: 1,
				getValue: (component) => Number(component.attributes.opacity ?? 1),
				setValue: (component, value: number) => ({ ...component, attributes: { ...component.attributes, opacity: String(value) } } as Props["component"]),
			},
		],
	}),
	createGroupAttribute({
		id: "border",
		label: "Border",
		collapsible: true,
		fields: [
			{
				id: "borderWidth",
				type: "text",
				label: "Width",
				placeholder: "e.g., 1px",
				defaultValue: "0",
				getValue: (component) => component.attributes.borderWidth || "0",
				setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, borderWidth: value } } as Props["component"]),
			},
			createSelectAttribute({
				id: "borderStyle",
				label: "Style",
				options: ["solid", "dashed", "dotted", "double"],
				defaultValue: "solid",
				getValue: (component) => component.attributes.borderStyle || "solid",
				setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, borderStyle: value } } as Props["component"]),
			}),
			createColorAttribute({
				id: "borderColor",
				label: "Color",
				defaultValue: "#000000",
				getValue: (component) => component.attributes.borderColor || "#000000",
				setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, borderColor: value } } as Props["component"]),
			}),
		],
	}),
	createSelectAttribute({
		id: "loading",
		label: "Loading",
		options: ["lazy", "eager"],
		defaultValue: "lazy",
	}),
	createSelectAttribute({
		id: "decoding",
		label: "Decoding",
		options: ["auto", "async", "sync"],
		defaultValue: "async",
	}),
]

const Icon = <ImageIcon className="h-4 w-4" />

const Component = (props: Props) => {
	const {
		src,
		alt,
		width,
		height,
		fallbackSrc,
		objectFit: objectFitValue,
		objectPosition,
		borderRadius,
		opacity,
		borderWidth,
		borderStyle,
		borderColor,
		"custom-classes": _,
		...restAttributes
	} = props.component.attributes
	const customClasses = readCustomClasses(props.component.attributes)
	const { childClassName } = props

	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={src || fallbackSrc}
			alt={alt}
			className={cn("block max-w-full h-auto", customClasses, childClassName)}
			style={{
				width: width || undefined,
				height: height || undefined,
				objectFit: objectFitValue as React.CSSProperties["objectFit"],
				objectPosition,
				borderRadius,
				opacity: opacity ? Number(opacity) : undefined,
				borderWidth,
				borderStyle,
				borderColor,
			}}
			{...restAttributes}
		/>
	)
}

export const componentMetadata = {
	tag,
	htmlTag: "img",
	label,
	keywords,
	defaultChildren: [],
	attributes,
	Icon,
	PreviewModeComponent: withDataSource(Component),
	EditModeComponent: withEditorControls(withDataSource(Component)),
} as const satisfies Metadata
