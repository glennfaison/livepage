"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComponentSettingsTabContent, useComponentSettingsEditor } from "./design-component-settings"
import { DataSourceListViewTabContent, useDataSourceSettingsEditor } from "./data-source-settings"
import { AppNode } from "../app-state"

export interface SettingsPopoverProps {
  component: AppNode
  children: React.ReactNode
}

export function SettingsPopover({ component, children }: SettingsPopoverProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false)
  const componentSettingsEditor = useComponentSettingsEditor({ component, setIsOpen })
  const dataSourceSettingsEditor = useDataSourceSettingsEditor({ component })
  const { componentInfo, ...componentSettingsTabContent } = componentSettingsEditor

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0 z-50" side="bottom" align="end" sideOffset={8}>
        <div className="bg-background border rounded-lg shadow-lg -m-1 h-[550px] max-h-[600px] overflow-clip flex flex-col">
          <div className="bg-foreground text-background p-3 rounded-t-lg">
            <h2 className="text-sm font-semibold">{componentInfo.label}</h2>
          </div>

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
                data-testid="data-sources-tab-trigger"
                value="data-sources"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-muted cursor-pointer"
              >
                Data Sources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <ComponentSettingsTabContent {...componentSettingsTabContent} />
            </TabsContent>

            <TabsContent value="data-sources" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <DataSourceListViewTabContent {...dataSourceSettingsEditor} />
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
}
