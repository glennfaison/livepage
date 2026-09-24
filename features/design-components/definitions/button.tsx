import { Button, buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"
import { withDataSource } from "@/features/data-sources/with-data-source"
import { MousePointerClick } from "lucide-react"
import React from "react"
import { withEditorControls, withTextEditing } from "@/features/page-builder/editor-controls"
import type { Props, SettingsField, Metadata } from "@/features/types"
import { createAttributeMap, createBooleanAttribute, createCustomClassesAttribute, createIdAttribute, createSelectAttribute, createTextAttribute, readTextChildren, readCustomClasses } from "@/features/design-component-runtime/shared/component-helpers"
import { cn } from "@/lib/utils"

const tag = "button" as const

const label = "Button"

const keywords = ["button", "click", "action", "btn"]

const defaultChildren = ["Button"] as const

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>
const buttonVariantOptions = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const satisfies ReadonlyArray<ButtonVariant>
const buttonSizeOptions = ["default", "sm", "lg"] as const satisfies ReadonlyArray<ButtonSize>

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
	createSelectAttribute({
		id: "variant",
		label: "Style",
		options: buttonVariantOptions,
		defaultValue: "default",
	}),
	createSelectAttribute({
		id: "size",
		label: "Size",
		options: buttonSizeOptions,
		defaultValue: "default",
	}),
	createBooleanAttribute({
		id: "disabled",
		label: "Disabled",
		defaultValue: false,
	}),
]

const attributesMap = createAttributeMap(attributes)

const Icon = <MousePointerClick className="h-4 w-4" />

const Component = (props: Props) => {
	const children = readTextChildren(props.component) || attributesMap.content.defaultValue
	const { variant, size, disabled, "custom-classes": _customClasses, ...filteredAttributes } = props.component.attributes
	const customClasses = readCustomClasses(props.component.attributes)
	const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, childClassName } = props

	return <Button variant={variant as ButtonVariant} size={size as ButtonSize} disabled={disabled === "true"} className={cn(customClasses, childClassName)} {...filteredAttributes}>{children as React.ReactNode}</Button>
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
