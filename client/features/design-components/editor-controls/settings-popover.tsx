"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/client/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import type { AppNode } from "@/client/features/types"
import { ComponentSettingsTabContent, useComponentSettingsEditor } from "./design-component-settings"
import { DataSourceListViewTabContent, useDataSourceSettingsEditor } from "./data-source-settings"
import { TemplateTabContent, useTemplateSettingsEditor } from "./template-settings"

export function SettingsPopover({
  component,
  children,
  open,
  onOpenChange,
}: Readonly<{
  component: AppNode
  children: React.ReactNode
  open?: boolean
  onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>
}>): React.JSX.Element {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isOpen = open ?? uncontrolledOpen
  const setIsOpen = onOpenChange ?? setUncontrolledOpen
  const componentSettingsEditor = useComponentSettingsEditor({ component, setIsOpen })
  const dataSourceSettingsEditor = useDataSourceSettingsEditor({ component })
  const templateSettingsEditor = useTemplateSettingsEditor({ component, setIsOpen })
  const { componentInfo, ...componentSettingsTabContent } = componentSettingsEditor

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[min(24rem,calc(100vw-2rem))] p-0 z-50" side="bottom" align="end" sideOffset={8} collisionPadding={12}>
        <div className="bg-background border rounded-lg shadow-lg -m-1 h-[min(600px,90vh)] overflow-clip flex flex-col">
          <div className="bg-foreground text-background p-3 rounded-t-lg">
            <h2 className="text-sm font-semibold">{componentInfo.label}</h2>
          </div>

          <Tabs defaultValue="settings" className="w-full flex flex-col flex-1 min-h-1">
            <TabsList className="grid w-full grid-cols-3 rounded-none bg-transparent border-b h-auto p-0">
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
              <TabsTrigger
                data-testid="templates-tab-trigger"
                value="templates"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-muted cursor-pointer"
              >
                Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <ComponentSettingsTabContent {...componentSettingsTabContent} />
            </TabsContent>

            <TabsContent value="data-sources" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <DataSourceListViewTabContent {...dataSourceSettingsEditor} />
            </TabsContent>

            <TabsContent value="templates" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <TemplateTabContent {...templateSettingsEditor} />
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
}
