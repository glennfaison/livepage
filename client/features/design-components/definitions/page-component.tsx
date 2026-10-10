"use client"

import { Button } from "@/client/components/ui/button"
import { useComponentOperationsContext } from "../editor-controls/component-operations-context"
import { AlignHorizontalSpaceBetweenIcon } from "lucide-react"
import { useCallback } from "react"
import type { Metadata, SettingsField, ViewModeProps, EditModeProps, ComponentCategory } from "@/client/features/types"
import { cn } from "@/client/lib/utils"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createSpacingAttributes, readBoxSpacing, createTextAttribute, createTextareaAttribute, readCustomClasses, getAccessibilityAttributes, getComponentInfo } from "@/client/features/design-components/primitives"
import { useDragDrop } from "../editor-controls/drag-drop-context"

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
	createTextAttribute({
		id: "description",
		label: "Description",
		placeholder: "Enter page description for SEO",
		defaultValue: "",
	}),
	createTextAttribute({
		id: "favicon",
		label: "Favicon URL",
		placeholder: "https://example.com/favicon.ico",
		defaultValue: "",
	}),
	createTextAttribute({
		id: "ogImage",
		label: "Open Graph Image",
		placeholder: "https://example.com/og-image.png",
		defaultValue: "",
	}),
	createTextAttribute({
		id: "canonicalUrl",
		label: "Canonical URL",
		placeholder: "https://example.com/page",
		defaultValue: "",
	}),
	createTextareaAttribute({
		id: "customHead",
		label: "Custom <head> HTML",
		placeholder: "<meta name=\"analytics\" content=\"...\">\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">",
		defaultValue: [],
	}),
	createTextareaAttribute({
		id: "customCss",
		label: "Custom CSS",
		placeholder: "/* Custom styles injected in export */\n:root { --custom-color: #123; }",
		defaultValue: [],
	}),
	createTextareaAttribute({
		id: "customJs",
		label: "Custom JavaScript",
		placeholder: "// Custom JS injected in export\nconsole.log('Page loaded');",
		defaultValue: [],
	}),
	...createSpacingAttributes("padding"),
]

const attributesMap = createAttributeMap(attributes)

function PreviewModeComponent(props: ViewModeProps) {
	const { component: currentPage } = props
	const { "custom-classes": _, ...attributes } = currentPage.attributes
	const { childClassName } = props
	const customClasses = readCustomClasses(currentPage.attributes)
	const padding = readBoxSpacing(attributes, attributesMap, "padding")
	const metadata = getComponentInfo(currentPage.tag)
	const accessibilityAttrs = getAccessibilityAttributes(currentPage, metadata)

	return (
		<section className="flex-1 bg-gray-50 overflow-y-visible relative" id={attributes.id} {...accessibilityAttrs}>
			<div
				className={cn("bg-white min-h-[800px] w-full md:w-[90%] mx-auto shadow-sm border rounded-md mt-8", customClasses, childClassName)}
				{...attributes}
				style={{
					padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				}}
			>
				{currentPage.children.map((component, childIndex) => {
					if (typeof component === "string") return component

					const Child = getComponentInfo(component.tag).PreviewModeComponent
					return <Child key={`${component.attributes.id}-${childIndex}`} {...props} component={component} parentTag={currentPage.tag} />
				})}
			</div>
		</section>
	)
}

function EditModeComponent(props: EditModeProps) {
	const { component: currentPage } = props
	const { "custom-classes": _, ...attributes } = currentPage.attributes
	const { childClassName, onMouseMove, onMouseLeave } = props
	const customClasses = readCustomClasses(currentPage.attributes)
	const padding = readBoxSpacing(attributes, attributesMap, "padding")
	const { setSelectedComponent, addComponent } = useComponentOperationsContext()
	const metadata = getComponentInfo(currentPage.tag)
	const accessibilityAttrs = getAccessibilityAttributes(currentPage, metadata)
	const { state, setDropTarget, endDrag } = useDragDrop()
	const hasChildren = currentPage.children.length > 0
	const isDropTarget = state.dropTarget?.type === "empty-layout" && state.dropTarget.parentId === attributes.id

	const appendComponent = useCallback(() => {
		addComponent({ tag: "row", parentId: attributes.id })
	}, [addComponent, attributes.id])

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.dataTransfer.dropEffect = "move"
		if (state.draggedComponentId) {
			setDropTarget({
				type: "empty-layout",
				parentId: attributes.id,
				parentTag: "page",
				index: 0,
			})
		}
	}

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
			if (state.dropTarget?.type === "empty-layout" && state.dropTarget.parentId === attributes.id) {
				setDropTarget(null)
			}
		}
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		endDrag()
	}

	return (
		<section className="flex-1 bg-gray-50 overflow-y-visible relative" id={attributes.id} {...accessibilityAttrs}>
			<div
				className={cn("bg-white min-h-[800px] w-full md:w-[90%] mx-auto shadow-sm border rounded-md mt-8", customClasses, childClassName)}
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

					const meta = getComponentInfo(component.tag)
					const Child = meta.EditModeComponent
					return (<Child key={`${component.attributes.id}-${childIndex}`} {...props} component={component} parentTag={currentPage.tag} />)
				})}

				<div
					className={cn(
						"flex flex-col items-center justify-center rounded-md p-4 min-h-24",
						props.pageBuilderMode === "edit" && "border-2 border-dashed border-gray-200",
						isDropTarget && "bg-primary/20 ring-2 ring-primary ring-offset-2"
					)}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
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
	acceptsChildren: true,
	allowedParentTags: ["site", "directory"],
	htmlTag: "div",
	htmlClassName: "column",
	label: "Page",
	category: "Layout" as ComponentCategory,
	keywords: [],
	defaultChildren: [],
	attributes,
	Icon: null,
	PreviewModeComponent: PreviewModeComponent,
	EditModeComponent: EditModeComponent,
} as const satisfies Metadata
