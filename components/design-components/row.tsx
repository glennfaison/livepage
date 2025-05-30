import { AlignHorizontalSpaceBetween } from "lucide-react"
import { ComponentType } from "./types"

export type ComponentAttributes = object

export type ComponentProps = {
	children?: React.ReactNode
	componentId: string
	attributes: ComponentAttributes
	pageBuilderMode: "edit" | "preview"
	setSelectedComponent: (componentId: string) => void
	updateComponent: (componentId: string, updates: Partial<ComponentAttributes>) => void
}

export const defaultAttributes: ComponentAttributes = {
}

export const tag: ComponentType = "row" as const

export const label = "Row"

export const keywords = ["row", "container", "layout", "horizontal"]

export const settingsFields = {
}

export const Icon = <AlignHorizontalSpaceBetween className="h-4 w-4" />

export const Component = ({ children, componentId, attributes, }: ComponentProps) => {
	return (
		<div className="p-4 border border-dashed border-gray-300 min-h-[50px] flex flex-row gap-2 justify-center"
			id={componentId}
			{...attributes}
		>
			{children}
		</div>
	);
}