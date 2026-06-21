"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useComponentOperationsContext } from "@/lib/component-operations-context"
import { AlignHorizontalSpaceBetweenIcon } from "lucide-react"
import { useCallback } from "react"
import { getComponentInfo } from "."
import type { Props, Metadata, Attribute } from "./types"
import { cn } from "@/lib/utils"

export const tag = "page" as const

const attributes: Attribute[] = [
  {
    id: "id",
    type: "text",
    label: "ID",
    placeholder: "ID",
    defaultValue: "",
    getValue: (component) => component.attributes.id || "",
    setValue: (component, value) => {
      return { ...component, attributes: { ...component.attributes, id: value } } as Props["component"]
    },
  },
  {
    id: "title",
    type: "text",
    label: "Title",
    placeholder: "Enter page title",
    defaultValue: "Page Title 1",
    getValue: (component) => component.attributes.title,
    setValue: (component, value: string) => {
      return { ...component, attributes: { ...component.attributes, title: value } } as Props["component"]
    },
  },
  {
    id: "padding-top",
    type: "text",
    label: "Padding Top",
    placeholder: "Padding Top",
    defaultValue: "0",
    getValue: (component) => component.attributes["padding-top"] || "",
    setValue: (component, value: unknown) => {
      return { ...component, attributes: { ...component.attributes, ["padding-top"]: value } } as Props["component"]
    },
  },
  {
    id: "padding-right",
    type: "text",
    label: "Padding Right",
    placeholder: "Padding Right",
    defaultValue: "0",
    getValue: (component) => component.attributes["padding-right"] || "",
    setValue: (component, value: unknown) => {
      return { ...component, attributes: { ...component.attributes, ["padding-right"]: value } } as Props["component"]
    },
  },
  {
    id: "padding-bottom",
    type: "text",
    label: "Padding Bottom",
    placeholder: "Padding Bottom",
    defaultValue: "0",
    getValue: (component) => component.attributes["padding-bottom"] || "",
    setValue: (component, value: unknown) => {
      return { ...component, attributes: { ...component.attributes, ["padding-bottom"]: value } } as Props["component"]
    },
  },
  {
    id: "padding-left",
    type: "text",
    label: "Padding Left",
    placeholder: "Padding Left",
    defaultValue: "0",
    getValue: (component) => component.attributes["padding-left"] || "",
    setValue: (component, value: unknown) => {
      return { ...component, attributes: { ...component.attributes, ["padding-left"]: value } } as Props["component"]
    },
  },
]

const attributesMap = Object.fromEntries((attributes).map((s) => [s.id, s]))

function Component(props: Props) {
  const { pageBuilderMode, component: currentPage } = props
  const attributes = currentPage.attributes
  const padding = {
    top: attributes["padding-top"] || attributesMap["padding-top"].defaultValue,
    right: attributes["padding-right"] || attributesMap["padding-right"].defaultValue,
    bottom: attributes["padding-bottom"] || attributesMap["padding-bottom"].defaultValue,
    left: attributes["padding-left"] || attributesMap["padding-left"].defaultValue,
  }
  const { setSelectedComponent, addComponent, updateComponent } = useComponentOperationsContext()

  const appendComponent = useCallback(() => {
    addComponent({ tag: "row", parentId: currentPage.attributes.id })
  }, [addComponent, currentPage.attributes.id])

  const updatePageTitle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const update = { attributes: { title: e.target.value } }
    updateComponent(currentPage.attributes.id, update)
  }, [updateComponent, currentPage.attributes.id])

  return (
    <main className="flex-1 overflow-hidden flex flex-col">
      <div className="container py-4 border-b mx-auto">
        <div className="flex justify-between items-center">
          <Input
            defaultValue={currentPage.attributes.title}
            onChange={updatePageTitle}
            className="text-xl font-semibold w-auto max-w-xs"
            id="page-title"
            placeholder="Page Title"
          />
          {/* <div className="flex gap-2">
          </div> */}
        </div>
      </div>

      <section className="flex-1 bg-gray-50 overflow-y-visible relative" id={currentPage.attributes.id}>
        <div
          className="bg-white min-h-[800px] max-w-5xl mx-auto shadow-sm border rounded-md mt-8"
          onClick={() => setSelectedComponent("")}
          {...attributes}
          style={{
            padding: `${padding.top} ${padding.right} ${padding.bottom} ${padding.left}`,
          }}
        >
          {currentPage.children.map((component) => {
            if (typeof component === "string") return component

            const meta = getComponentInfo(component.tag)
            const Child = props.pageBuilderMode === "preview" ? meta.ViewModeComponent : meta.EditModeComponent
            return (<Child key={component.attributes.id} {...props as Props} component={component} />)
          })}

          {pageBuilderMode === "edit" && (
            <div className={cn(
              "flex flex-col items-center justify-center rounded-md p-4",
              props.pageBuilderMode === "edit" && "border-2 border-dashed border-gray-200",
            )}>
              <Button
                variant="outline"
                className="gap-2 px-4 py-2"
                onClick={appendComponent}
              >
                <AlignHorizontalSpaceBetweenIcon className="h-5 w-5" />
                <span>Add Row</span>
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export const metadata: Metadata = {
  tag,
  label: "Page",
  keywords: [],
  defaultChildren: [],
  attributes,
  Icon: null,
  ViewModeComponent: Component,
  EditModeComponent: Component,
}