"use client"

import { Button } from "@/components/ui/button"
import { useComponentOperationsContext } from "@/lib/component-operations-context"
import { AlignHorizontalSpaceBetweenIcon } from "lucide-react"
import { useCallback } from "react"
import type { Props, Metadata, Attribute, ViewModeProps, EditModeProps } from "./types"
import { cn } from "@/lib/utils"
import { createAttributeMap, createSpacingAttributes, readBoxSpacing, createTextAttribute } from "./shared/component-helpers"

const tag = "page" as const

const attributes: Attribute[] = [
	createTextAttribute({
		id: "id",
		label: "ID",
		placeholder: "ID",
		defaultValue: "",
	}),
	createTextAttribute({
		id: "title",
		label: "Title",
		placeholder: "Enter page title",
		defaultValue: "Page Title 1",
	}),
	...createSpacingAttributes("padding"),
]

const attributesMap = createAttributeMap(attributes)

function _ViewModeComponent(props: ViewModeProps) {
	const { component: currentPage } = props
	const attributes = currentPage.attributes
	const padding = readBoxSpacing(attributes, attributesMap, "padding")

	return (
		<section className="flex-1 bg-gray-50 overflow-y-visible relative" id={attributes.id}>
			<div
				className="bg-white min-h-[800px] max-w-5xl mx-auto shadow-sm border rounded-md mt-8"
				{...attributes}
				style={{
					padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				}}
			>
				{currentPage.children.map((component) => {
					if (typeof component === "string") return component

					const { getComponentInfo } = require(".") as typeof import(".")
					const meta = getComponentInfo(component.tag)
					const Child = meta.ViewModeComponent
					return (<Child key={component.attributes.id} {...props} component={component} />)
				})}
			</div>
		</section>
	)
}

function _EditModeComponent(props: EditModeProps) {
	const { component: currentPage } = props
	const attributes = currentPage.attributes
	const padding = readBoxSpacing(attributes, attributesMap, "padding")
	const { setSelectedComponent, addComponent } = useComponentOperationsContext()

	const appendComponent = useCallback(() => {
		addComponent({ tag: "row", parentId: attributes.id })
	}, [addComponent, attributes.id])

	return (
		<section className="flex-1 bg-gray-50 overflow-y-visible relative" id={attributes.id}>
			<div
				className="bg-white min-h-[800px] max-w-5xl mx-auto shadow-sm border rounded-md mt-8"
				onClick={() => setSelectedComponent("")}
				{...attributes}
				style={{
					padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				}}
			>
				{currentPage.children.map((component) => {
					if (typeof component === "string") return component

					const { getComponentInfo } = require(".") as typeof import(".")
					const meta = getComponentInfo(component.tag)
					const Child = meta.EditModeComponent
					return (<Child key={component.attributes.id} {...props} component={component} />)
				})}

				<div className={cn(
					"flex flex-col items-center justify-center rounded-md p-4",
					props.pageBuilderMode === "edit" && "border-2 border-dashed border-gray-200",
				)}>
					<Button
						variant="outline"
						className="gap-2 px-4 py-2"
						onClick={appendComponent}
					>
						<AlignHorizontalSpaceBetweenIcon className="h-5 w-5" />
						<span>Add Row</span>
					</Button>
				</div>
			</div>
		</section>
	)
}

export const componentMetadata = {
	tag,
	label: "Page",
	keywords: [],
	defaultChildren: [],
	attributes,
	Icon: null,
	ViewModeComponent: _ViewModeComponent,
	EditModeComponent: _EditModeComponent,
} as const satisfies Metadata
