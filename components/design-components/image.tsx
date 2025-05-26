import { ImageIcon } from "lucide-react"

export type ComponentAttributes = {
	src?: string
	alt?: string
	width?: string
	height?: string
	fallbackSrc?: string
}

export type ComponentProps = {
	componentId: string
	componentAttributes: ComponentAttributes
	pageBuilderMode: "edit" | "preview"
	setSelectedComponent: (componentId: string) => void
	updateComponent: (componentId: string, updates: Partial<ComponentAttributes>) => void
}

export const defaultAttributes: ComponentAttributes = {
	src: "",
	alt: "Image Description",
	width: "auto",
	height: "auto",
	fallbackSrc: "/placeholder.svg",
}

export const tag = "image" as const

export const Label = "Image"

export const keywords = ["image", "picture", "photo", "graphic", "media"]

export const settingsFields = {
	src: {
		id: "src",
		type: "text",
		label: "Image Source",
		placeholder: "Enter image URL",
	},
	alt: {
		id: "alt",
		type: "text",
		label: "Alt Text",
		placeholder: "Enter image description",
	},
	width: {
		id: "width",
		type: "text",
		label: "Width",
		placeholder: "Enter width (e.g., 100px, 50%)",
	},
	height: {
		id: "height",
		type: "text",
		label: "Height",
		placeholder: "Enter height (e.g., 100px, auto)",
	},
	fallbackSrc: {
		id: "fallbackSrc",
		type: "text",
		label: "Fallback Image Source",
		placeholder: "Enter fallback image URL",
	},
}

export const Icon = () => <ImageIcon className="h-4 w-4" />

export const Component = ({ componentId, componentAttributes, pageBuilderMode, setSelectedComponent }: ComponentProps) => {
	const { src, fallbackSrc, ...restAttributes } = componentAttributes
	return (
		<img
			src={src || fallbackSrc}
			className="max-w-full h-auto"
			onClick={(e) => {
				if (pageBuilderMode === "edit") {
					e.stopPropagation()
					setSelectedComponent(componentId)
				}
			}}
			{...restAttributes}
		/>
	)
}