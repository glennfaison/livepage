"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlignHorizontalSpaceBetweenIcon } from "lucide-react"
import type { ComponentProps, ComponentTag } from "./types"
import React, { useCallback } from "react"
import { getComponentInfo } from "."

export type ComponentAttributes = {
  title: string
}

export const defaultChildren = []

export function Component(props: ComponentProps<"page">) {
  const { pageBuilderMode, component: currentPage } = props
  const { setSelectedComponent, addComponent, updateComponent } = props

  const appendComponent = useCallback(
    () => addComponent({ tag: "row", parentId: currentPage.id }),
    [addComponent, currentPage.id]
  )

return (
  <main className="flex-1 overflow-hidden flex flex-col">
    <div className="container py-4 border-b mx-auto">
      <div className="flex justify-between items-center">
        <Input
          defaultValue={currentPage.attributes.title}
          onChange={(e) => updateComponent(currentPage.id, { attributes: { title: e.target.value } })}
          className="text-xl font-semibold w-auto max-w-xs"
          id="page-title"
          placeholder="Page Title"
        />
        <div className="flex gap-2">
        </div>
      </div>
    </div>

    <div className="flex-1 overflow-auto bg-gray-50 p-4">
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
