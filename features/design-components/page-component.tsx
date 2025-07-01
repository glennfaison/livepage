"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useComponentOperationsContext } from "@/lib/component-operations-context"
import { AlignHorizontalSpaceBetweenIcon } from "lucide-react"
import { useCallback } from "react"
import { getComponentInfo } from "."
import type { ComponentProps, ComponentTag, DesignComponent } from "./types"

export type ComponentAttributes = {
  id: string
  title: string
}

export const tag: ComponentTag = "page" as const

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
  title: {
    id: "title",
    type: "text",
    label: "Title",
    placeholder: "Enter page title",
    defaultValue: "Page Title 1",
    getValue: (component: DesignComponent<typeof tag>) => component.attributes.title,
    setValue: (component: DesignComponent<typeof tag>, value: string) => {
      return { ...component, attributes: { ...component.attributes, title: value } }
    },
  },
}

export function Component(props: ComponentProps<"page">) {
  const { pageBuilderMode, component: currentPage } = props
  const { setSelectedComponent, addComponent, updateComponent } = useComponentOperationsContext()

  const appendComponent = useCallback(() => {
    addComponent({ tag: "row", parentId: currentPage.id })
  }, [addComponent, currentPage.id])

  const updatePageTitle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const update = { attributes: { title: e.target.value } } as DesignComponent<typeof tag>
    updateComponent(currentPage.id, update)
  }, [updateComponent, currentPage.id])

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
          <div className="flex gap-2">
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-4" id={currentPage.attributes.id}>
        <div
          className="bg-white min-h-[800px] max-w-5xl mx-auto shadow-sm border rounded-md p-8"
          onClick={() => setSelectedComponent("")}
        >
          {currentPage.children.map((component) => {
            const Component = getComponentInfo(component.tag).Component
            return (<Component key={component.id} {...props as ComponentProps<ComponentTag>} component={component} />)
          })}

          {pageBuilderMode === "edit" && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-md p-4">
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
      </div>
    </main>
  )
}
