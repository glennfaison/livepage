import React, { useCallback } from "react"
import { AlignHorizontalSpaceBetween, Plus } from "lucide-react"
import type { SettingsField, Metadata, EditModeProps, Props, ViewModeProps } from "@/features/types"
import { ComponentSelectorPopover } from "@/features/page-builder/component-selector-popover"
import { Divider, useDividerVisibility } from "@/features/page-builder/layout-divider"
import { Button } from "@/components/ui/button"
import { cn, intersperseAndAppend } from "@/lib/utils"
import { componentTagList, getComponentInfo } from "."
import { withDataSource } from "@/features/design-components/decorators/with-data-source"
import { useComponentOperationsContext } from "@/lib/component-operations-context"
import { withEditorControls } from "./decorators/with-editor-controls"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createSpacingAttributes, readBoxSpacing, readCustomClasses } from "./shared/component-helpers"

const tag = "row" as const

const label = "Row"

const keywords = ["row", "container", "layout", "horizontal"]

const attributes = [
	createIdAttribute(),
	createCustomClassesAttribute(),
	...createSpacingAttributes("padding"),
	...createSpacingAttributes("margin"),
] as const satisfies ReadonlyArray<SettingsField>

const attributesMap = createAttributeMap(attributes)

const Icon = <AlignHorizontalSpaceBetween className="size-4" />

const _ViewModeComponent = (props: ViewModeProps) => {
	const { component } = props
	const { "custom-classes": _, ...attributes } = component.attributes
	const customClasses = readCustomClasses(component.attributes)
	const padding = readBoxSpacing(attributes, attributesMap, "padding")
	const margin = readBoxSpacing(attributes, attributesMap, "margin")

	const childComponents = props.component.children.map((child) => {
		if (typeof child === "string") {
			return child
		}
		const meta = getComponentInfo(child.tag)
		const ChildComponent = meta.ViewModeComponent

		return (
			<span className="flex-1 self-stretch h-full" key={child.attributes.id}>
				<span className="flex h-full w-full items-stretch">
					<ChildComponent {...props} component={child} />
				</span>
			</span>
		)
	})

	return (
		<div
			className={cn("min-h-[50px] flex flex-row justify-center items-stretch", "p-0 gap-0", customClasses)}
			{...attributes}
			style={{
				padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				margin: `${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`,
			}}
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
			<ComponentSelectorPopover onSelect={onAddChildComponent} componentTagList={componentTagList}>
				<Button variant="outline" size="icon" className="rounded-full h-6 w-6">
					<Plus className="h-3 w-3" />
					<span className="sr-only">Add component</span>
				</Button>
			</ComponentSelectorPopover>
		</div>
	)
}

const _EditModeComponent = (props: EditModeProps) => {
	const { component } = props
	const { "custom-classes": _, ...attributes } = component.attributes
	const customClasses = readCustomClasses(component.attributes)
	const padding = readBoxSpacing(attributes, attributesMap, "padding")
	const margin = readBoxSpacing(attributes, attributesMap, "margin")
	const hasChildren = !!component.children.length
	const { addComponent } = useComponentOperationsContext()
	const {
		visibleVerticalDividers,
		handleChildMouseMove,
		handleChildMouseLeave,
	} = useDividerVisibility()

	const onAddChildComponent = useCallback(
		(tag: string): void => addComponent({ tag, parentId: attributes.id, index: 0 }),
		[addComponent, attributes.id]
	)

	const handleAddAtIndex = useCallback((tag: string, dividerIndex: number) => {
		const childIndex = Math.floor(dividerIndex / 2)
		addComponent({ tag, parentId: attributes.id, index: childIndex })
	}, [addComponent, attributes.id])

	const children = component.children.map((child, childIndex) => {
		if (typeof child === "string") return child
		const meta = getComponentInfo(child.tag)
		const ChildComponent = meta.EditModeComponent
		return (
			<span className="flex-1 self-stretch h-full"
				key={child.attributes.id}
				onMouseMove={(e) => handleChildMouseMove(e, childIndex)}
				onMouseLeave={() => handleChildMouseLeave(childIndex)}
			>
				<span className="flex h-full w-full items-stretch">
					<ChildComponent {...props} component={child} />
				</span>
			</span>
		)
	})

	const WrappedChildren = intersperseAndAppend(children, null).map((item, index) => {
		return item === null ? (
			<Divider
				key={`divider-${index}`}
				orientation="vertical"
				onAddComponent={handleAddAtIndex}
				index={index}
				isVisible={visibleVerticalDividers.has(index)} />
		) : (
			<React.Fragment key={index}>{item}</React.Fragment>
		)
	})

	return (
		<div
			className={cn(
				"min-h-[50px] flex flex-row justify-center items-stretch",
				"p-0 gap-0",
				"border border-dashed border-gray-300",
				customClasses,
			)}
			{...attributes}
			style={{
				padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				margin: `${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`,
			}}
		>
			{hasChildren ? WrappedChildren : <EmptyColumnContent onAddChildComponent={onAddChildComponent} />}
		</div>
	)
}

export const componentMetadata = {
	tag,
	label,
	keywords,
	defaultChildren: [],
	attributes,
	Icon,
	ViewModeComponent: withDataSource(_ViewModeComponent as React.ComponentType<Props>),
	EditModeComponent: withEditorControls(withDataSource(_EditModeComponent as React.ComponentType<Props>)),
} as const satisfies Metadata
