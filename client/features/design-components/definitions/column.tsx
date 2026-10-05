import React, { useCallback } from "react"
import { AlignVerticalSpaceBetween, Plus } from "lucide-react"
import type { SettingsField, Metadata, EditModeProps, Props, ViewModeProps } from "@/client/features/types"
import { ComponentSelectorPopover } from "../editor-controls/component-selector-popover"
import { Divider, useDividerVisibility } from "../editor-controls/layout-divider"
import { useComponentOperationsContext } from "../editor-controls/component-operations-context"
import { withEditorControls } from "../editor-controls/decorators/with-editor-controls"
import { Button } from "@/client/components/ui/button"
import { cn, intersperseAndAppend } from "@/client/lib/utils"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createLayoutAttributes, createSpacingAttributes, readBoxSpacing, readCustomClasses, readLayoutStyles, getAccessibilityAttributes, getComponentInfo } from "@/client/features/design-components/primitives"
import { withDataSource } from "@/client/features/data-sources"

const tag = "column" as const

const label = "Column"

const keywords = ["column", "col", "container", "layout", "vertical"]

const attributes: SettingsField[] = [
	createIdAttribute(),
	createCustomClassesAttribute(),
	...createLayoutAttributes(),
	...createSpacingAttributes("padding"),
	...createSpacingAttributes("margin"),
]

const attributesMap = createAttributeMap(attributes)

const Icon = <AlignVerticalSpaceBetween className="h-4 w-4 bg-gray-200 rounded" />

const PreviewModeComponent = (props: ViewModeProps) => {
	const { component } = props
	const { "custom-classes": _, ...attributes } = component.attributes
	const { childClassName } = props
	const customClasses = readCustomClasses(component.attributes)
	const padding = readBoxSpacing(attributes, attributesMap, "padding")
	const margin = readBoxSpacing(attributes, attributesMap, "margin")
	const layoutStyles = readLayoutStyles(component.attributes)
	const slotClassName = ""
	const metadata = getComponentInfo(component.tag)
	const accessibilityAttrs = getAccessibilityAttributes(component, metadata)

	const childComponents = component.children.map((child, childIndex) => {
		if (typeof child === "string") return child
		const ChildComponent = getComponentInfo(child.tag).PreviewModeComponent
		return (
			<ChildComponent
				{...props}
				key={`${child.attributes.id}-${childIndex}`}
				component={child}
				parentTag={component.tag}
				childClassName={slotClassName}
			/>
		)
	})

	return (
		<div
			className={cn("min-h-[50px] flex flex-col justify-start", "p-0 gap-0", customClasses, childClassName)}
			{...attributes}
			style={{
				padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				margin: `${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`,
				...layoutStyles,
			}}
			{...accessibilityAttrs}
		>
			{childComponents}
		</div>
	)
}

const EmptyColumnContent = ({
	onAddChildComponent,
}: Readonly<{
	onAddChildComponent: (tag: string) => void
}>) => {
	return (
		<div className="flex items-center justify-center h-full w-full text-muted-foreground">
			<ComponentSelectorPopover onSelect={onAddChildComponent} parentTag={tag}>
				<Button variant="outline" size="icon" className="rounded-full h-6 w-6">
					<Plus className="h-3 w-3" />
					<span className="sr-only">Add component</span>
				</Button>
			</ComponentSelectorPopover>
		</div>
	)
}

const EditModeComponent = (props: EditModeProps) => {
	const { component } = props
	const { "custom-classes": _, ...attributes } = component.attributes
	const { childClassName, onMouseMove, onMouseLeave } = props
	const customClasses = readCustomClasses(component.attributes)
	const padding = readBoxSpacing(attributes, attributesMap, "padding")
	const margin = readBoxSpacing(attributes, attributesMap, "margin")
	const layoutStyles = readLayoutStyles(component.attributes)
	const hasChildren = !!component.children.length
	const { addComponent } = useComponentOperationsContext()
	const {
		visibleHorizontalDividers,
		handleChildMouseMove,
		handleChildMouseLeave,
	} = useDividerVisibility()
	const metadata = getComponentInfo(component.tag)
	const accessibilityAttrs = getAccessibilityAttributes(component, metadata)

	const onAddChildComponent = useCallback(
		(tag: string): void => addComponent({ tag, parentId: attributes.id, index: 0 }),
		[addComponent, attributes.id]
	)

	const handleAddAtIndex = useCallback((tag: string, dividerIndex: number) => {
		const childIndex = Math.floor(dividerIndex / 2)
		addComponent({ tag, parentId: attributes.id, index: childIndex })
	}, [addComponent, attributes.id])
	const slotClassName = ""

	const children = component.children.map((child, childIndex) => {
		if (typeof child === "string") return child
		const meta = getComponentInfo(child.tag)
		const ChildComponent = meta.EditModeComponent

		return (
			<ChildComponent
				{...props}
				key={`${child.attributes.id}-${childIndex}`}
				component={child}
				parentTag={component.tag}
				childClassName={slotClassName}
				onMouseMove={(e) => handleChildMouseMove(e, childIndex)}
				onMouseLeave={() => handleChildMouseLeave(childIndex)}
			/>
		)
	})

	const WrappedChildren = intersperseAndAppend(children, null).map((item, index) => {
		return item === null ? (
			<Divider
				key={`divider-${index}`}
				orientation="horizontal"
				parentTag={component.tag}
				onAddComponent={handleAddAtIndex}
				index={index}
				isVisible={visibleHorizontalDividers.has(index)} />
		) : (
			<React.Fragment key={index}>{item}</React.Fragment>
		)
	})

	return (
		<div
			className={cn(
				"min-h-[50px] flex flex-col justify-start",
				"p-0 gap-0",
				"border border-dashed border-gray-300",
				customClasses,
				childClassName,
			)}
			onMouseMove={onMouseMove}
			onMouseLeave={onMouseLeave}
			{...attributes}
			style={{
				padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				margin: `${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`,
				...layoutStyles,
			}}
			{...accessibilityAttrs}
		>
			{hasChildren ? WrappedChildren : <EmptyColumnContent onAddChildComponent={onAddChildComponent} />}
		</div>
	)
}

export const componentMetadata = {
	tag,
	acceptsChildren: true,
	htmlTag: "div",
	htmlClassName: "column",
	label,
	keywords,
	defaultChildren: [],
	attributes,
	Icon,
	PreviewModeComponent: withDataSource(PreviewModeComponent as React.ComponentType<Props>),
	EditModeComponent: withEditorControls(withDataSource(EditModeComponent as React.ComponentType<Props>)),
} as const satisfies Metadata
