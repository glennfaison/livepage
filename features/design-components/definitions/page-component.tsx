"use client"

import { Button } from "@/components/ui/button"
import { useComponentOperationsContext } from "@/features/page-builder/editor-controls"
import { AlignHorizontalSpaceBetweenIcon } from "lucide-react"
import { useCallback } from "react"
import type { Props, Metadata, SettingsField, ViewModeProps, EditModeProps } from "@/features/types"
import { cn } from "@/lib/utils"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createSpacingAttributes, readBoxSpacing, createTextAttribute, readCustomClasses } from "@/features/design-component-runtime/shared/component-helpers"
import { getRegisteredComponentInfo } from "@/features/design-component-runtime/lookup"

const tag = "page" as const

const attributes: SettingsField[] = [
	createIdAttribute(),
	createCustomClassesAttribute(),
	createTextAttribute({
		id: "title",
		label: "Title",
		placeholder: "Enter page title",
		defaultValue: "Page Title 1",
	}),
	...createSpacingAttributes("padding"),
]

const attributesMap = createAttributeMap(attributes)

function _PreviewModeComponent(props: ViewModeProps) {
	const { component: currentPage } = props
	const { "custom-classes": _, ...attributes } = currentPage.attributes
	const { childClassName } = props
	const customClasses = readCustomClasses(currentPage.attributes)
	const padding = readBoxSpacing(attributes, attributesMap, "padding")

	return (
		<section className="flex-1 bg-gray-50 overflow-y-visible relative" id={attributes.id}>
			<div
				className={cn("bg-white min-h-[800px] max-w-5xl mx-auto shadow-sm border rounded-md mt-8", customClasses, childClassName)}
				{...attributes}
				style={{
					padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				}}
			>
				{currentPage.children.map((component, childIndex) => {
					if (typeof component === "string") return component

					const Child = getRegisteredComponentInfo(component.tag).PreviewModeComponent
					return <Child key={`${component.attributes.id}-${childIndex}`} {...props} component={component} />
				})}
			</div>
		</section>
	)
}

function _EditModeComponent(props: EditModeProps) {
	const { component: currentPage } = props
	const { "custom-classes": _, ...attributes } = currentPage.attributes
	const { childClassName, onMouseMove, onMouseLeave } = props
	const customClasses = readCustomClasses(currentPage.attributes)
	const padding = readBoxSpacing(attributes, attributesMap, "padding")
	const { setSelectedComponent, addComponent } = useComponentOperationsContext()

	const appendComponent = useCallback(() => {
		addComponent({ tag: "row", parentId: attributes.id })
	}, [addComponent, attributes.id])

	return (
		<section className="flex-1 bg-gray-50 overflow-y-visible relative" id={attributes.id}>
			<div
				className={cn("bg-white min-h-[800px] max-w-5xl mx-auto shadow-sm border rounded-md mt-8", customClasses, childClassName)}
				onClick={() => setSelectedComponent("")}
				onMouseMove={onMouseMove}
				onMouseLeave={onMouseLeave}
				{...attributes}
				style={{
					padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				}}
			>
				{currentPage.children.map((component, childIndex) => {
					if (typeof component === "string") return component

					const meta = getRegisteredComponentInfo(component.tag)
					const Child = meta.EditModeComponent
					return (<Child key={`${component.attributes.id}-${childIndex}`} {...props} component={component} />)
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
	htmlTag: "div",
	htmlClassName: "column",
	label: "Page",
	keywords: [],
	defaultChildren: [],
	attributes,
	Icon: null,
	PreviewModeComponent: _PreviewModeComponent,
	EditModeComponent: _EditModeComponent,
} as const satisfies Metadata
