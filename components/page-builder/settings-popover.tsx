"use client"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import React from "react"
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

export const SettingsPopover: React.FC<SettingsPopoverProps<ComponentType>> = <Tag extends ComponentType>({
  component,
  onSave,
  children,
}: SettingsPopoverProps<Tag>) => {
  const [formData, setFormData] = React.useState<ComponentAttributes<Tag>>({ ...component.attributes })
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"settings" | "connect">("settings")
  const componentData = getComponentInfo(component.tag)

  const handleSave = () => {
    for (const key in componentData.defaultAttributes) {
      if (formData[key] === "" || String(formData[key]).trim() === "") {
        formData[key] = componentData.defaultAttributes[key]
      }
    }
    onSave(formData)
    setIsOpen(false)
  }

  const handleDiscard = () => {
    setFormData({ ...component.attributes })
    setIsOpen(false)
  }

  const handleFieldChange = (fieldId: keyof ComponentAttributes<Tag>, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const settingsFields = React.useMemo(
    () => Object.values(componentData.settingsFields),
    [componentData.settingsFields],
  ) as SettingsField<Tag>[]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0 z-50" side="bottom" align="end" sideOffset={8}>
        <div className="bg-background border rounded-lg shadow-lg -m-1">
          {/* Header */}
          <div className="bg-foreground text-background p-3 rounded-t-lg">
            <h2 className="text-sm font-semibold">{componentData.label}</h2>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "settings"
                  ? "bg-muted text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </button>
            <button
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "connect"
                  ? "bg-muted text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setActiveTab("connect")}
            >
              Connect
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "settings" ? (
              <div className="space-y-4">
                {settingsFields.map((field) => (
                  <div className="space-y-2" key={field.id as string}>
                    <Label htmlFor={field.id as string}>{field.label}</Label>
                    {field.type === "textarea" ? (
                      <textarea
                        id={field.id as string}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={field.placeholder}
                        value={(formData[field.id] as string) || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      />
                    ) : (
                      <Input
                        type={field.type}
                        id={field.id as string}
                        placeholder={field.placeholder}
                        value={(formData[field.id] as string) || ""}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <h3 className="font-medium text-foreground mb-2">Connect Feature</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your components to data sources, APIs, and external services.
                </p>
                <p className="text-xs text-muted-foreground mt-2">Coming soon...</p>
              </div>
            )}
          </div>

          {/* Footer Buttons - only show for settings tab */}
          {activeTab === "settings" && (
            <div className="flex border-t">
              <Button
                variant="ghost"
                className="flex-1 rounded-none rounded-bl-lg bg-muted hover:bg-muted/80 text-foreground h-12"
                onClick={handleDiscard}
              >
                Discard
              </Button>
              <Button
                variant="ghost"
                className="flex-1 rounded-none rounded-br-lg bg-foreground hover:bg-foreground/90 text-background h-12"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
