"use client"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { GripVertical } from "lucide-react"
import React, { useCallback } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { getComponentInfo } from "../design-components"
import type { ComponentAttributes, ComponentType, DesignComponent, SettingsField } from "../design-components/types"

// Settings Popover Component
export interface SettingsPopoverProps<Tag extends ComponentType> {
  component: DesignComponent<Tag>
  onSave: (updates: ComponentAttributes<Tag>) => void
  children: React.ReactNode
}

export const SettingsPopover: React.FC<SettingsPopoverProps<ComponentType>> = <Tag extends ComponentType>({ component, onSave, children }: SettingsPopoverProps<Tag>) => {
  const [formData, setFormData] = React.useState<ComponentAttributes<Tag>>({ ...component.attributes })
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 })
  const [isPositioned, setIsPositioned] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  const componentData = getComponentInfo(component.tag)

  const handleSave = () => {
    onSave(formData)
    setIsOpen(false)
  }

  const handleDiscard = () => {
    setFormData({ ...component.attributes })
    setIsOpen(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
      setIsPositioned(true)
    }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }
  }, [isDragging, dragOffset.x, dragOffset.y])

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragOffset, handleMouseMove])

  const settingsFields = React.useMemo(
    () => Object.values(componentData.settingsFields),
    [componentData.settingsFields],
  ) as SettingsField<Tag>[]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn("w-80 z-50 p-0", isPositioned && "fixed", isDragging && "cursor-grabbing")}
        side="bottom"
        align="end"
        sideOffset={8}
        style={
          isPositioned
            ? {
                left: `${position.x}px`,
                top: `${position.y}px`,
                position: "fixed",
              }
            : undefined
        }
      >
        <div ref={popoverRef} className="bg-background border rounded-lg shadow-lg p-0">
          {/* Draggable Header */}
          <div
            className={cn(
              "bg-muted border-b p-3 rounded-t-lg flex items-center justify-between cursor-grab active:cursor-grabbing",
              isDragging && "cursor-grabbing",
            )}
            onMouseDown={handleMouseDown}
          >
            <h4 className="font-medium leading-none">{componentData.label} Settings</h4>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-4">
              {settingsFields.map((field) => (
                <div className="space-y-2" key={field.id as string}>
                  <Label htmlFor={field.id as string}>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <textarea
                      id={field.id as string}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder={field.placeholder}
                      defaultValue={formData[field.id] as string || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field.id]: e.target.value }))}
                    />
                  ) : (
                    <Input
                      type={field.type}
                      id={field.id as string}
                      placeholder={field.placeholder}
                      defaultValue={formData[field.id] as string || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field.id]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDiscard} className="flex-1">
                Discard
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
