import { withDataSource } from "@/features/data-sources/with-data-source"
import { ExternalLink } from "lucide-react"
import React from "react"
import { withEditorControls, withTextEditing } from "@/features/page-builder/editor-controls"
import type { Props, Metadata, SettingsField } from "@/features/types"
import { createAttributeMap, createCustomClassesAttribute, createIdAttribute, createSelectAttribute, createTextAppearanceAttributes, createTextAttribute, readCustomClasses, readTextAppearance, readTextChildren } from "@/features/design-component-runtime/shared/component-helpers"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const tag = "link" as const
const label = "Link"
const keywords = ["link", "anchor", "url", "href", "navigation"]
const defaultChildren = ["Link"] as const

const attributes: SettingsField[] = [
  createIdAttribute(),
  createCustomClassesAttribute(),
  createTextAttribute({
    id: "content",
    label: "Content",
    placeholder: "Enter link text",
    defaultValue: defaultChildren[0],
    getValue: (component) => readTextChildren(component),
    setValue: (component, value) => ({ ...component, children: [value] } as Props["component"]),
  }),
  createTextAttribute({
    id: "href",
    label: "URL",
    placeholder: "https://example.com or #section",
    defaultValue: "#",
  }),
  createSelectAttribute({
    id: "target",
    label: "Target",
    options: ["_self", "_blank", "_parent", "_top", "modal"],
    defaultValue: "_self",
  }),
  createTextAppearanceAttributes(),
]

const attributesMap = createAttributeMap(attributes)
const Icon = <ExternalLink className="h-4 w-4" />

const Component = (props: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const children = readTextChildren(props.component) || attributesMap.content.defaultValue
  const { href = "#", target = "_self", "custom-classes": _customClasses, id: _id, ...rest } = props.component.attributes
  const customClasses = readCustomClasses(props.component.attributes)
  const textAppearance = readTextAppearance(props.component.attributes)
  const { pageBuilderMode: _, selectedComponentId: __, selectedComponentAncestors: ___, childClassName } = props
  const opensModal = target === "modal"

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    if (!opensModal) return
    event.preventDefault()
    setIsModalOpen(true)
  }

  return (
    <>
      <a
        {...rest}
        href={href}
        target={opensModal ? undefined : target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        onClick={handleClick}
        aria-haspopup={opensModal ? "dialog" : undefined}
        className={cn("text-primary underline-offset-4 hover:underline", customClasses, childClassName)}
        style={textAppearance}
        data-component-id={props.component.attributes.id}
      >
        {children as React.ReactNode}
      </a>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="grid-rows-[auto_minmax(0,1fr)] p-0">
          <DialogHeader>
            <DialogTitle>{children}</DialogTitle>
          </DialogHeader>
            <iframe
              src={href}
              title={String(children)}
              className="min-h-0 flex-1 border-0"
            />
        </DialogContent>
      </Dialog>
    </>
  )
}

export const componentMetadata = {
  tag,
  htmlTag: "a",
  label,
  keywords,
  defaultChildren,
  attributes,
  Icon,
  PreviewModeComponent: withDataSource(Component),
  EditModeComponent: withEditorControls(withTextEditing(withDataSource(Component))),
} as const satisfies Metadata
