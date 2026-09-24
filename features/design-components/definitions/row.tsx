import React, { useCallback } from "react"
import { AlignHorizontalSpaceBetween, Plus } from "lucide-react"
import type { SettingsField, Metadata, EditModeProps, Props, ViewModeProps } from "@/features/types"
import { ComponentSelectorPopover, Divider, useDividerVisibility, useComponentOperationsContext, withEditorControls } from "@/features/page-builder/editor-controls"
import { Button } from "@/components/ui/button"
import { cn, intersperseAndAppend } from "@/lib/utils"
import { componentTagList, getRegisteredComponentInfo, createAttributeMap, createCustomClassesAttribute, createIdAttribute, createLayoutAttributes, createSelectAttribute, createSpacingAttributes, readBoxSpacing, readCustomClasses, readLayoutStyles } from "@/features/design-component-runtime/primitives"
import { withDataSource } from "@/features/data-sources/with-data-source"

const tag = "row" as const

const label = "Row"

const keywords = ["row", "container", "layout", "horizontal"]

const attributes = [
	createIdAttribute(),
	createCustomClassesAttribute(),
	...createLayoutAttributes(),
	createSelectAttribute({
		id: "child-sizing",
		label: "Child Sizing",
		options: ["equal", "natural"],
		defaultValue: "equal",
	}),
	...createSpacingAttributes("padding"),
	...createSpacingAttributes("margin"),
] as const satisfies ReadonlyArray<SettingsField>

const attributesMap = createAttributeMap(attributes)

const Icon = <AlignHorizontalSpaceBetween className="size-4" />

const _PreviewModeComponent = (props: ViewModeProps) => {
	const { component } = props
	const { "custom-classes": _, ...attributes } = component.attributes
	const { childClassName } = props
	const customClasses = readCustomClasses(component.attributes)
	const padding = readBoxSpacing(attributes, attributesMap, "padding")
	const margin = readBoxSpacing(attributes, attributesMap, "margin")
	const layoutStyles = readLayoutStyles(component.attributes)
	const slotClassName = component.attributes["child-sizing"] === "natural"
		? "self-stretch"
		: "flex-1 basis-0 min-w-0 self-stretch"

	const childComponents = props.component.children.map((child, childIndex) => {
		if (typeof child === "string") return child
		const ChildComponent = getRegisteredComponentInfo(child.tag).PreviewModeComponent
		return (
			<ChildComponent
				{...props}
				key={`${child.attributes.id}-${childIndex}`}
				component={child}
				childClassName={slotClassName}
			/>
		)
	})

	return (
		<div
			{...attributes}
			className={cn("min-h-[50px] flex flex-row flex-nowrap justify-start items-stretch", "p-0 gap-0", customClasses, childClassName)}
			style={{
				padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				margin: `${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`,
				...layoutStyles,
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
		<div className="flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-sm bg-muted/30 px-4 text-muted-foreground">
			<ComponentSelectorPopover onSelect={onAddChildComponent} componentTagList={componentTagList}>
				<Button variant="outline" size="icon" className="rounded-full h-6 w-6">
					<Plus className="size-3.5" />
					<span className="text-xs font-medium">Add component</span>
				</Button>
			</ComponentSelectorPopover>
		</div>
	)
}

const _EditModeComponent = (props: EditModeProps) => {
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
	const slotClassName = component.attributes["child-sizing"] === "natural"
		? "self-stretch"
		: "flex-1 basis-0 min-w-0 self-stretch"

	const children = component.children.map((child, childIndex) => {
		if (typeof child === "string") return child
		const meta = getRegisteredComponentInfo(child.tag)
		const ChildComponent = meta.EditModeComponent
		return (
			<ChildComponent
				{...props}
				key={`${child.attributes.id}-${childIndex}`}
				component={child}
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
			{...attributes}
			className={cn(
				"min-h-[50px] flex flex-row flex-nowrap justify-start items-stretch",
				"p-0 gap-0",
				"border border-dashed border-gray-300",
				customClasses,
				childClassName,
			)}
			onMouseMove={onMouseMove}
			onMouseLeave={onMouseLeave}
			style={{
				padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				margin: `${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`,
				...layoutStyles,
			}}
		>
			{hasChildren ? WrappedChildren : <EmptyColumnContent onAddChildComponent={onAddChildComponent} />}
		</div>
	)
}

export const componentMetadata = {
	tag,
	htmlTag: "div",
	htmlClassName: "row",
	label,
	keywords,
	defaultChildren: [],
	attributes,
	Icon,
	PreviewModeComponent: withDataSource(_PreviewModeComponent as React.ComponentType<Props>),
	EditModeComponent: withEditorControls(withDataSource(_EditModeComponent as React.ComponentType<Props>)),
} as const satisfies Metadata
