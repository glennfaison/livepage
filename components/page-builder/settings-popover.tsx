"use client"

import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getComponentInfo } from "@/features/design-components"
import type { ComponentAttributes, ComponentTag, DesignComponent, SettingsField } from "../../features/design-components/types"
import { connectionIdList, getConnectionInfo } from "@/features/connections"
import { Search } from "lucide-react"
import { ConnectionId } from "@/features/connections/types"

// Settings Popover Component
export interface SettingsPopoverProps<Tag extends ComponentTag> {
  component: DesignComponent<Tag>
  onSave: (updates: ComponentAttributes<Tag>) => void
  children: React.ReactNode
}

// Connection selector button
const ConnectionSelectorButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) => {
  return (
    <Button variant="outline" size="sm" className="flex flex-col items-center h-auto p-2 gap-1 cursor-pointer" onClick={onClick}>
      <div className="p-1 bg-muted rounded-md">{icon}</div>
      <span className="text-xs text-wrap">{label}</span>
    </Button>
  )
}

export const SettingsPopover: React.FC<SettingsPopoverProps<ComponentTag>> = <Tag extends ComponentTag>({
  component,
  onSave,
  children,
}: SettingsPopoverProps<Tag>) => {
  const [searchConnectionTerm, setSearchConnectionTerm] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const componentInfo = getComponentInfo(component.tag)

  const filteredConnections = React.useMemo(() => {
    const connections = connectionIdList.map((connId) => getConnectionInfo(connId))
    if (!searchConnectionTerm.trim()) return connections

    const search = searchConnectionTerm.toLowerCase()
    return connections.filter(
      (conn) =>
        conn.label.toLowerCase().includes(search) ||
        conn.keywords.some((keyword) => keyword.includes(search)),
    )
  }, [searchConnectionTerm])

  const handleSelectConnection = (connectionId: ConnectionId) => {
    console.log("selected connection:", connectionId)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0 z-50" side="bottom" align="end" sideOffset={8}>
        <div className="bg-background border rounded-lg shadow-lg -m-1 h-[550px] max-h-[600px] overflow-clip flex flex-col">
          {/* Header */}
          <div className="bg-foreground text-background p-3 rounded-t-lg">
            <h2 className="text-sm font-semibold">{componentInfo.label}</h2>
          </div>
          {/* Tabs */}
          <Tabs defaultValue="settings" className="w-full flex flex-col flex-1 min-h-1">
            <TabsList className="grid w-full grid-cols-2 rounded-none bg-transparent border-b h-auto p-0">
              <TabsTrigger
                data-testid="settings-tab-trigger"
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-muted cursor-pointer"
              >
                Settings
              </TabsTrigger>
              <TabsTrigger
                data-testid="connect-tab-trigger"
                value="connect"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-muted cursor-pointer"
              >
                Connect
              </TabsTrigger>
            </TabsList>

            {/* Settings Tab Content */}
            <TabsContent value="settings" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <ComponentSettingsTabContent
                component={component}
                onSave={onSave}
                setIsOpen={setIsOpen}
              />
            </TabsContent>

            {/* Connect Tab Content */}
            <TabsContent value="connect" className="p-4 mt-0">
              <ConnectionListViewTabContent component={component} onSave={onSave} setIsOpen={setIsOpen} />
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ComponentSettingsTabContent<Tag extends ComponentTag>({ component, onSave, setIsOpen }: Omit<SettingsPopoverProps<Tag>, "children"> & { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [formData, setFormData] = React.useState<ComponentAttributes<Tag>>({ ...component.attributes })
  const componentInfo = getComponentInfo(component.tag)

  const handleSave = () => {
    for (const key in componentInfo.defaultAttributes) {
      if (formData[key] === "" || String(formData[key]).trim() === "") {
        formData[key] = componentInfo.defaultAttributes[key]
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
    () => Object.values(componentInfo.settingsFields),
    [componentInfo.settingsFields],
  ) as SettingsField<Tag>[]

  return (
    <>
      <div className="space-y-4 p-4 overflow-y-scroll flex-1">
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

      {/* Footer Buttons for Settings Tab */}
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
    </>
  )
}

function ConnectionListViewTabContent<Tag extends ComponentTag>({
  component,
  onSave,
  setIsOpen,
}: Omit<SettingsPopoverProps<Tag>, "children"> & { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [searchConnectionTerm, setSearchConnectionTerm] = React.useState("")

  const filteredConnections = React.useMemo(() => {
    const connections = connectionIdList.map((connId) => getConnectionInfo(connId))
    if (!searchConnectionTerm.trim()) return connections

    const search = searchConnectionTerm.toLowerCase()
    return connections.filter(
      (conn) =>
        conn.label.toLowerCase().includes(search) ||
        conn.keywords.some((keyword) => keyword.includes(search)),
    )
  }, [searchConnectionTerm])

  const handleSelectConnection = (connectionId: ConnectionId) => {
    console.log("selected connection:", connectionId)
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search connections..."
          defaultValue={searchConnectionTerm}
          onChange={(e) => setSearchConnectionTerm(e.target.value)}
          className="pl-10 h-8"
        />
      </div>

      {/* Connections Grid */}
      {filteredConnections.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {filteredConnections.map((connection) => (
            <ConnectionSelectorButton
              key={connection.id}
              icon={connection.Icon}
              label={connection.label}
              onClick={() => handleSelectConnection(connection.id)}
            />
          ))}
        </div>
      ) : (
        <div className="col-span-3 text-center py-4 text-muted-foreground text-sm">No components found</div>
      )}
    </div>
  )
}