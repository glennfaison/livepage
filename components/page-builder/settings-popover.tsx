import { cn } from "@/lib/utils"
import { Label } from "@radix-ui/react-label"
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover"
import { GripVertical } from "lucide-react"
import React from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { getComponentInfo } from "../design-components"
import { ComponentType, SettingsField } from "../design-components/types"


// Settings Popover Component
export interface SettingsPopoverProps {
  component: any
  onSave: (props: any) => void
  children: React.ReactNode
}

export const SettingsPopover: React.FC<SettingsPopoverProps> = ({ component, onSave, children }) => {
  const [formData, setFormData] = React.useState<any>({ ...component.attributes })
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 })
  const [isPositioned, setIsPositioned] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  const componentData = getComponentInfo(component.tag as ComponentType)

  const handleSave = () => {
    onSave(formData)
    setIsOpen(false)
  }

  const handleDiscard = () => {
    setFormData({
      content: "",
      src: component.src || "",
      alt: component.alt || "",
    })
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

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }
  }

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
  }, [isDragging, dragOffset])

  const settingsFields = React.useMemo(() => Object.values(componentData.settingsFields), [componentData.settingsFields]) as SettingsField[]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn("w-80", isPositioned && "fixed z-50", isDragging && "cursor-grabbing")}
        side="bottom"
        align="end"
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
            <h4 className="font-medium leading-none">
              {component.label}{" "}
              Settings
            </h4>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-4">
              {settingsFields.map((field) => (
                <div className="space-y-2" key={field.id}>
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input type={field.type}
                    id={field.id}
                    defaultValue={formData[field.id] || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, [field.id]: e.target.value }))}
                  />
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