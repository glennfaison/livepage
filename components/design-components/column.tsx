import { AlignVerticalSpaceBetween } from "lucide-react"
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

export const tag: ComponentType = "column" as const

export const label = "Column"

export const keywords = ["column", "col", "container", "layout", "vertical"]

export const settingsFields = {
}

export const Icon = <AlignVerticalSpaceBetween className="h-4 w-4 bg-gray-200 rounded" />

export const Component = ({ children, componentId, attributes, }: ComponentProps) => {
	return (
		<div
			className="p-4 border border-dashed border-gray-300 min-h-[50px] flex flex-col gap-2 justify-center"
			id={componentId}
			{...attributes}
		>
			{children}
		</div>
	);
}