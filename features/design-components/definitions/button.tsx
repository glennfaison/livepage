import { Button } from "@/components/ui/button"
import { withDataSource } from "@/features/data-sources/with-data-source"
import { MousePointerClick } from "lucide-react"
import React from "react"
import { withEditorControls } from "@/features/page-builder/decorators/with-editor-controls"
import { withTextEditing } from "@/features/page-builder/decorators/with-text-editing"
import type { Props, SettingsField, Metadata } from "@/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createTextAttribute, readTextChildren, readCustomClasses } from "@/features/design-component-runtime/shared/component-helpers"
import { cn } from "@/lib/utils"

const tag = "button" as const

const label = "Button"

const keywords = ["button", "click", "action", "btn"]

const defaultChildren = ["Button"] as const

const attributes: SettingsField[] = [
	createIdAttribute(),
	createCustomClassesAttribute(),
	createTextAttribute({
		id: "content",
		label: "Content",
		placeholder: "Enter button text",
		defaultValue: "",
		getValue: (component) => readTextChildren(component),
		setValue: (component, value) => ({ ...component, children: [value] } as Props["component"]),
	}),
	{
		id: "variant",
		type: "select",
		label: "Style",
		options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
		defaultValue: "default",
		getValue: (component) => component.attributes.variant || "default",
		setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, variant: value } } as Props["component"]),
	},
	{
		id: "size",
		type: "select",
		label: "Size",
		options: ["default", "sm", "lg"],
		defaultValue: "default",
		getValue: (component) => component.attributes.size || "default",
		setValue: (component, value: string) => ({ ...component, attributes: { ...component.attributes, size: value } } as Props["component"]),
	},
	{
		id: "disabled",
		type: "boolean",
		label: "Disabled",
		defaultValue: false,
		getValue: (component) => component.attributes.disabled === "true",
		setValue: (component, value: boolean) => ({ ...component, attributes: { ...component.attributes, disabled: String(value) } } as Props["component"]),
	},
]

const attributesMap = createAttributeMap(attributes)

const Icon = <MousePointerClick className="h-4 w-4" />

const Component = (props: Props) => {
	const children = readTextChildren(props.component) || attributesMap.content.defaultValue
	const { variant, size, disabled, "custom-classes": _customClasses, ...filteredAttributes } = props.component.attributes
	const customClasses = readCustomClasses(props.component.attributes)
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, childClassName } = props

	return <Button variant={variant as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | undefined} size={size as "default" | "sm" | "lg" | undefined} disabled={disabled === "true"} className={cn(customClasses, childClassName)} {...filteredAttributes}>{children as React.ReactNode}</Button>
}

export const componentMetadata = {
	tag,
	htmlTag: "button",
	label,
	keywords,
	defaultChildren,
	attributes,
	Icon,
	PreviewModeComponent: withDataSource(Component),
	EditModeComponent: withEditorControls(withTextEditing(withDataSource(Component))),
} as const satisfies Metadata
