import React, { useCallback, useState } from "react"
import { AlignHorizontalSpaceBetween, Plus } from "lucide-react"
import type { SettingsField, Metadata, EditModeProps, Props, ViewModeProps, ComponentCategory } from "@/client/features/types"
import { ComponentSelectorPopover } from "../editor-controls/component-selector-popover"
import { DividerOverlay, useDividerVisibility } from "../editor-controls/layout-divider"
import { useComponentOperationsContext } from "../editor-controls/component-operations-context"
import { withEditorControls } from "../editor-controls/decorators/with-editor-controls"
import { Button } from "@/client/components/ui/button"
import { cn } from "@/client/lib/utils"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createLayoutAttributes, createSelectAttribute, createSpacingAttributes, readBoxSpacing, readCustomClasses, readLayoutStyles, getAccessibilityAttributes, getComponentInfo } from "@/client/features/design-components/primitives"
import { withDataSource } from "@/client/features/data-sources"
import { useDragDrop } from "../editor-controls/drag-drop-context"
import type { ElementBox } from "../editor-controls/shared/use-element-box"
import { readElementBox } from "../editor-controls/shared/use-element-box"

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
	parentId,
}: Readonly<{
	onAddChildComponent: (tag: string) => void
	parentId: string
}>) => {
	const { state, setDropTarget, endDrag } = useDragDrop()
	const isDropTarget = state.dropTarget?.type === "empty-layout" && state.dropTarget.parentId === parentId

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.dataTransfer.dropEffect = "move"
		if (state.draggedComponentId) {
			setDropTarget({
				type: "empty-layout",
				parentId,
				parentTag: "row",
				index: 0,
			})
		}
	}

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
			if (state.dropTarget?.type === "empty-layout" && state.dropTarget.parentId === parentId) {
				setDropTarget(null)
			}
		}
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		endDrag()
	}

	return (
		<div
			className={cn(
				"flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-sm bg-muted/30 px-4 text-muted-foreground",
				isDropTarget && "bg-primary/20 ring-2 ring-primary ring-offset-2"
			)}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<ComponentSelectorPopover onSelect={onAddChildComponent} parentTag="row">
				<Button variant="outline" size="icon" className="rounded-full h-6 w-6" title="Add component">
					<Plus className="size-3.5" />
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
		visibleVerticalDividers,
		handleChildMouseMove: onChildMouseMove,
		handleChildMouseLeave: onChildMouseLeave,
	} = useDividerVisibility()
	const metadata = getComponentInfo(component.tag)
	const accessibilityAttrs = getAccessibilityAttributes(component, metadata)

	const onAddChildComponent = useCallback(
		(tag: string): void => addComponent({ tag, parentId: attributes.id, index: 0 }),
		[addComponent, attributes.id]
	)

	const handleAddAtIndex = useCallback((tag: string, index: number) => {
		addComponent({ tag, parentId: attributes.id, index })
	}, [addComponent, attributes.id])

	const [childBoxes, setChildBoxes] = useState<Map<number, ElementBox>>(new Map())

	const handleChildMouseMove = useCallback(
		(e: React.MouseEvent, childIndex: number) => {
			const box = readElementBox(e.currentTarget as Element)
			if (box) {
				setChildBoxes((prev) => {
					const next = new Map(prev)
					next.set(childIndex, box)
					return next
				})
			}
			onChildMouseMove(e, childIndex)
		},
		[onChildMouseMove]
	)

	const handleChildMouseLeave = useCallback((childIndex: number) => {
		onChildMouseLeave(childIndex)
	}, [onChildMouseLeave])
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

	const dividers: React.ReactNode[] = []
	component.children.forEach((child, childIndex) => {
		if (typeof child === "string") return
		const box = childBoxes.get(childIndex)
		if (!box) return
		if (visibleVerticalDividers.has(childIndex * 2)) {
			dividers.push(
				<DividerOverlay
					key={`row-divider-start-${childIndex}`}
					orientation="vertical"
					edge="start"
					box={box}
					onAddComponent={handleAddAtIndex}
					parentTag={component.tag}
					parentId={attributes.id}
					insertIndex={childIndex}
				/>
			)
		}
		if (visibleVerticalDividers.has((childIndex + 1) * 2)) {
			dividers.push(
				<DividerOverlay
					key={`row-divider-end-${childIndex}`}
					orientation="vertical"
					edge="end"
					box={box}
					onAddComponent={handleAddAtIndex}
					parentTag={component.tag}
					parentId={attributes.id}
					insertIndex={childIndex + 1}
				/>
			)
		}
	})

	return (
		<div
			{...attributes}
			className={cn(
				"min-h-[50px] flex flex-row justify-start items-stretch",
				"p-0 gap-0",
				containerClassName,
				"outline outline-dashed outline-gray-300",
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
			{hasChildren ? (
				<>
					{children}
					{dividers}
				</>
			) : (
				<EmptyColumnContent onAddChildComponent={onAddChildComponent} parentId={attributes.id} />
			)}
		</div>
	)
}

export const componentMetadata = {
	tag,
	acceptsChildren: true,
	htmlTag: "div",
	htmlClassName: "row",
	label,
	category: "Layout" as ComponentCategory,
	keywords,
	defaultChildren: [],
	attributes,
	Icon,
	PreviewModeComponent: withDataSource(PreviewModeComponent as React.ComponentType<Props>),
	EditModeComponent: withEditorControls(withDataSource(EditModeComponent as React.ComponentType<Props>)),
} as const satisfies Metadata
