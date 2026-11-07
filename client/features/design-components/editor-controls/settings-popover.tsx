"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger, POPOVER_PANEL_MAX_HEIGHT_CLASS } from "@/client/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { cn } from "@/client/lib/utils"
import type { AppNode } from "@/client/features/types"
import { ComponentSettingsTabContent, useComponentSettingsEditor } from "./design-component-settings"
import { DataSourceListViewTabContent, useDataSourceSettingsEditor } from "./data-source-settings"
import { ComponentTemplatesTabContent, useComponentTemplateSettingsEditor } from "./component-settings"

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
  const componentTemplatesEditor = useComponentTemplateSettingsEditor({ component, setIsOpen })
  const { componentInfo, ...componentSettingsTabContent } = componentSettingsEditor
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isOpen) return
    const node = contentRef.current
    let raf = 0
    const clamp = () => {
      const el = contentRef.current
      if (el) {
        const wrapper = el.parentElement
        const wRect = wrapper?.getBoundingClientRect()
        if (wRect) {
          const vh = window.innerHeight
          const ph = el.offsetHeight
          let y = 0
          if (wRect.top < 12) y = 12 - wRect.top
          if (wRect.top + y + ph > vh - 12) y = vh - 12 - ph - wRect.top
          el.style.transform = y ? "translateY(" + y + "px)" : ""
        }
      }
      raf = requestAnimationFrame(clamp)
    }
    raf = requestAnimationFrame(clamp)
    return () => {
      cancelAnimationFrame(raf)
      if (node) node.style.transform = ""
    }
  }, [isOpen])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent ref={contentRef} className="w-[min(24rem,calc(100vw-2rem))] p-0 z-50" side="bottom" align="end" sideOffset={8} collisionPadding={12}>
        <div
          data-testid="component-settings-panel"
          className={cn(
            "bg-background border rounded-lg shadow-lg -m-1 flex flex-col overflow-clip",
            POPOVER_PANEL_MAX_HEIGHT_CLASS,
          )}
        >
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
                Component Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <ComponentSettingsTabContent {...componentSettingsTabContent} />
            </TabsContent>

            <TabsContent value="data-sources" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <DataSourceListViewTabContent {...dataSourceSettingsEditor} />
            </TabsContent>

            <TabsContent value="templates" className="mt-0 flex-1 flex flex-col min-h-1 overflow-clip">
              <ComponentTemplatesTabContent {...componentTemplatesEditor} />
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
}
