import { AlignHorizontalSpaceBetween, Plus } from "lucide-react"
import { ComponentProps, ComponentTag, DesignComponent } from "./types"
import { cn, intersperseAndAppend } from "@/lib/utils"
import { componentTagList, getComponentInfo } from "."
import { ComponentSelectorPopover } from "@/components/page-builder/component-selector-popover"
import { Button } from "@/components/ui/button"
import { useCallback } from "react"
import React from "react"
import { Divider, useDividerVisibility } from "@/components/page-builder/layout-divider"
import { withConnection } from "@/features/design-components/hoc/connected-component-hoc"
import { withEditorControls } from "./hoc/component-controls-hoc"
import { useComponentOperationsContext } from "@/lib/component-operations-context"

export type ComponentAttributes = {
	id: string
	"padding-top": string
	"padding-right": string
	"padding-bottom": string
	"padding-left": string
	"margin-top": string
	"margin-right": string
	"margin-bottom": string
	"margin-left": string
}

export const tag: ComponentTag = "row" as const

export const label = "Row"

export const keywords = ["row", "container", "layout", "horizontal"]

export const settingsFields = {
	id: {
		id: "id",
		type: "text",
		label: "ID",
		placeholder: "ID",
		defaultValue: "",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes.id || "",
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, id: value } };
		},
	},
	"padding-top": {
		id: "padding-top",
		type: "text",
		label: "Padding Top",
		placeholder: "Padding Top",
		defaultValue: "0",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes["padding-top"] || "",
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["padding-top"]: value } };
		},
	},
	"padding-right": {
		id: "padding-right",
		type: "text",
		label: "Padding Right",
		placeholder: "Padding Right",
		defaultValue: "0",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes["padding-right"] || "",
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["padding-right"]: value } };
		},
	},
	"padding-bottom": {
		id: "padding-bottom",
		type: "text",
		label: "Padding Bottom",
		placeholder: "Padding Bottom",
		defaultValue: "0",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes["padding-bottom"] || "",
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["padding-bottom"]: value } };
		},
	},
	"padding-left": {
		id: "padding-left",
		type: "text",
		label: "Padding Left",
		placeholder: "Padding Left",
		defaultValue: "0",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes["padding-left"] || "",
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["padding-left"]: value } };
		},
	},
	"margin-top": {
		id: "margin-top",
		type: "text",
		label: "Margin Top",
		placeholder: "Margin Top",
		defaultValue: "0",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes["margin-top"] || "",
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["margin-top"]: value } };
		},
	},
	"margin-right": {
		id: "margin-right",
		type: "text",
		label: "Margin Right",
		placeholder: "Margin Right",
		defaultValue: "0",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes["margin-right"] || "",
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["margin-right"]: value } };
		},
	},
	"margin-bottom": {
		id: "margin-bottom",
		type: "text",
		label: "Margin Bottom",
		placeholder: "Margin Bottom",
		defaultValue: "0",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes["margin-bottom"] || "",
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["margin-bottom"]: value } };
		},
	},
	"margin-left": {
		id: "margin-left",
		type: "text",
		label: "Margin Left",
		placeholder: "Margin Left",
		defaultValue: "0",
		getValue: (component: DesignComponent<typeof tag>) => component.attributes["margin-left"] || "",
		setValue: (component: DesignComponent<typeof tag>, value: unknown) => {
			return { ...component, attributes: { ...component.attributes, ["margin-left"]: value } };
		},
	},
}

export const Icon = <AlignHorizontalSpaceBetween className="h-4 w-4" />

const Component_ = (props: ComponentProps<typeof tag>) => {
	const { component } = props
	const attributes = component.attributes
	const padding = {
		top: attributes["padding-top"] || settingsFields["padding-top"].defaultValue,
		right: attributes["padding-right"] || settingsFields["padding-right"].defaultValue,
		bottom: attributes["padding-bottom"] || settingsFields["padding-bottom"].defaultValue,
		left: attributes["padding-left"] || settingsFields["padding-left"].defaultValue,
	}
	const margin = {
		top: attributes["margin-top"] || settingsFields["margin-top"].defaultValue,
		right: attributes["margin-right"] || settingsFields["margin-right"].defaultValue,
		bottom: attributes["margin-bottom"] || settingsFields["margin-bottom"].defaultValue,
		left: attributes["margin-left"] || settingsFields["margin-left"].defaultValue,
	}
	const hasChildren = !!component.children.length
	const { addComponent } = useComponentOperationsContext()
	const {
		visibleVerticalDividers,
		handleChildMouseMove,
		handleChildMouseLeave,
	} = useDividerVisibility()

	const onAddChildComponent = useCallback(
		(tag: ComponentTag): void => addComponent({ tag, parentId: component.attributes.id, index: 0 }),
		[addComponent, component.attributes.id]
	)

	const handleAddAtIndex = useCallback((tag: ComponentTag, dividerIndex: number) => {
		const childIndex = Math.floor(dividerIndex / 2)
		addComponent({ tag, parentId: component.attributes.id, index: childIndex })
	}, [addComponent, component.attributes.id])

	const children = props.component.children.map(
		(child, childIndex) => {
			const ChildComponent = getComponentInfo(child.tag).Component
			return (
				<span className="flex-1"
					key={child.attributes.id}
					onMouseMove={(e) => handleChildMouseMove(e, childIndex)}
					onMouseLeave={() => handleChildMouseLeave(childIndex)}
				>
					<ChildComponent {...props as ComponentProps<ComponentTag>} component={child} />
				</span>
			)
		}
	)
	const WrappedChilden = props.pageBuilderMode === "preview" ? children : (
		intersperseAndAppend(children, null).map((item, index) => {
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
	)

	return (
		<div className={cn(
			"border border-dashed border-gray-300 min-h-[50px] flex flex-row justify-center items-center",
			"p-0 gap-0",
		)}
			{...attributes}
			style={{
				padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
				margin: `${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`,
			}}
		>
			{hasChildren ? WrappedChilden : (
				<div className="flex items-center justify-center h-full text-muted-foreground flex-1">
					<ComponentSelectorPopover onSelect={onAddChildComponent} componentTagList={componentTagList}>
						<Button variant="outline" size="icon" className="rounded-full h-6 w-6">
							<Plus className="h-3 w-3" />
							<span className="sr-only">Add component</span>
						</Button>
					</ComponentSelectorPopover>
				</div>
			)}
		</div>
	);
}

const ConnectedComponent = withConnection(Component_)
export const Component = withEditorControls(ConnectedComponent)