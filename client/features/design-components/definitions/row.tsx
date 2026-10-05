import React, { useCallback } from "react"
import { AlignHorizontalSpaceBetween, Plus } from "lucide-react"
import type { SettingsField, Metadata, EditModeProps, Props, ViewModeProps } from "@/client/features/types"
import { ComponentSelectorPopover } from "../editor-controls/component-selector-popover"
import { Divider, useDividerVisibility } from "../editor-controls/layout-divider"
import { useComponentOperationsContext } from "../editor-controls/component-operations-context"
import { withEditorControls } from "../editor-controls/decorators/with-editor-controls"
import { Button } from "@/client/components/ui/button"
import { cn, intersperseAndAppend } from "@/client/lib/utils"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createLayoutAttributes, createSelectAttribute, createSpacingAttributes, readBoxSpacing, readCustomClasses, readLayoutStyles, getAccessibilityAttributes, getComponentInfo } from "@/client/features/design-components/primitives"
import { withDataSource } from "@/client/features/data-sources"

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
	createSelectAttribute({
		id: "wrap",
		label: "Wrap",
		options: ["nowrap", "wrap"],
		defaultValue: "nowrap",
	}),
	...createSpacingAttributes("padding"),
	...createSpacingAttributes("margin"),
] as const satisfies ReadonlyArray<SettingsField>

const attributesMap = createAttributeMap(attributes)

const Icon = <AlignHorizontalSpaceBetween className="size-4" />

/**
 * A flex item only wraps onto a new line when its hypothetical main size exceeds the
 * remaining space, and that size comes from the basis. Equal sizing therefore has to use a
 * content-based basis (`basis-auto`) instead of `basis-0`: a zero basis reports a
 * hypothetical size of zero, so `flex-wrap` could never break the line and every template
 * that asked for wrapping silently stayed on one line. `basis-auto` reports the item's own
 * width, so line-breaking works, and `flex-1` still grows each child to fill its line.
 * A percentage basis is deliberately avoided here: `basis-full` would report the whole row
 * as the item's size and stack every child on its own line.
 */
function readRowLayout(componentAttributes: Readonly<Record<string, string>>): Readonly<{
	containerClassName: string
	slotClassName: string
}> {
	const wraps = componentAttributes["wrap"] === "wrap"
	const sizesChildrenNaturally = componentAttributes["child-sizing"] === "natural"

	return {
		containerClassName: wraps ? "flex-wrap" : "flex-nowrap",
		slotClassName: sizesChildrenNaturally
			? "self-stretch"
			: wraps
				? "flex-1 basis-auto min-w-0 self-stretch"
				: "flex-1 basis-0 min-w-0 self-stretch",
	}
}

const PreviewModeComponent = (props: ViewModeProps) => {
	const { component } = props
	const { "custom-classes": _, ...attributes } = component.attributes
	const { childClassName } = props
	const customClasses = readCustomClasses(component.attributes)
	const padding = readBoxSpacing(attributes, attributesMap, "padding")
	const margin = readBoxSpacing(attributes, attributesMap, "margin")
	const layoutStyles = readLayoutStyles(component.attributes)
	const { containerClassName, slotClassName } = readRowLayout(component.attributes)
	const metadata = getComponentInfo(component.tag)
	const accessibilityAttrs = getAccessibilityAttributes(component, metadata)

	const childComponents = props.component.children.map((child, childIndex) => {
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
			{...attributes}
			className={cn("min-h-[50px] flex flex-row justify-start items-stretch", "p-0 gap-0", containerClassName, customClasses, childClassName)}
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
		<div className="flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-sm bg-muted/30 px-4 text-muted-foreground">
			<ComponentSelectorPopover onSelect={onAddChildComponent} parentTag={tag}>
				<Button variant="outline" size="icon" className="rounded-full h-6 w-6">
					<Plus className="size-3.5" />
					<span className="text-xs font-medium">Add component</span>
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
		visibleVerticalDividers,
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
	const { containerClassName, slotClassName } = readRowLayout(component.attributes)

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
				orientation="vertical"
				parentTag={component.tag}
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
				"min-h-[50px] flex flex-row justify-start items-stretch",
				"p-0 gap-0",
				containerClassName,
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
	htmlClassName: "row",
	label,
	keywords,
	defaultChildren: [],
	attributes,
	Icon,
	PreviewModeComponent: withDataSource(PreviewModeComponent as React.ComponentType<Props>),
	EditModeComponent: withEditorControls(withDataSource(EditModeComponent as React.ComponentType<Props>)),
} as const satisfies Metadata
