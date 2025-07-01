"use client"

import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { ImageIcon } from "lucide-react"
import { withEditorControls } from "./hoc/component-controls-hoc"
import type { ComponentProps, ComponentTag, DesignComponent } from "./types"

export type ComponentAttributes = {
	id: string
	src?: string
	alt?: string
	width?: string
	height?: string
	fallbackSrc?: string
}

export const defaultAttributes: ComponentAttributes = {
	id: "",
	src: "",
	alt: "Image Description",
	width: "100%",
	height: "auto",
	fallbackSrc: "/placeholder-img.svg?height=300&width=300",
} as const

export const tag: ComponentTag = "image" as const

export const label = "Image"

export const keywords = ["image", "picture", "photo", "graphic", "media"]

export const settingsFields = {
	id: {
		id: "id",
		type: "text",
		label: "ID",
		placeholder: "ID",
		defaultValue: "",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes.id || "",
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, id: value } };
		},
	},
	src: {
		id: "src",
		type: "text",
		label: "Image Source",
		placeholder: "Enter image URL",
		defaultValue: "",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes.src,
		setValue: (component: DesignComponent<typeof tag>, value: string): DesignComponent<typeof tag> => ({
			...component, attributes: { ...component.attributes, src: value },
		}),
	},
	alt: {
		id: "alt",
		type: "text",
		label: "Alt Text",
		placeholder: "Enter image description",
		defaultValue: "Image Description",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes.alt,
		setValue: (component: DesignComponent<typeof tag>, value: string): DesignComponent<typeof tag> => ({
			...component, attributes: { ...component.attributes, alt: value },
		}),
	},
	width: {
		id: "width",
		type: "text",
		label: "Width",
		placeholder: "Enter width (e.g., 100px, 50%)",
		defaultValue: "100%",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes.width,
		setValue: (component: DesignComponent<typeof tag>, value: string): DesignComponent<typeof tag> => ({
			...component, attributes: { ...component.attributes, width: value },
		}),
	},
	height: {
		id: "height",
		type: "text",
		label: "Height",
		placeholder: "Enter height (e.g., 100px, auto)",
		defaultValue: "auto",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes.height,
		setValue: (component: DesignComponent<typeof tag>, value: string): DesignComponent<typeof tag> => ({
			...component, attributes: { ...component.attributes, height: value },
		}),
	},
	fallbackSrc: {
		id: "fallbackSrc",
		type: "text",
		label: "Fallback Image Source",
		placeholder: "Enter fallback image URL",
		defaultValue: "/placeholder-img.svg?height=300&width=300",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes.fallbackSrc,
		setValue: (component: DesignComponent<typeof tag>, value: string): DesignComponent<typeof tag> => ({
			...component, attributes: { ...component.attributes, fallbackSrc: value },
		}),
	},
}

export const Icon = <ImageIcon className="h-4 w-4" />

const Component_ = (props: ComponentProps<typeof tag>) => {
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

const ConnectedComponent = withConnection(Component_)
export const Component = withEditorControls(ConnectedComponent)