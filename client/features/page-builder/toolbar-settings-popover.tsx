"use client"

import { Button } from "@/client/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/client/components/ui/popover"
import { cn } from "@/client/lib/utils"
import { Bot, Copy, Download, Eye, GripVertical, Keyboard, LayoutDashboard, Palette, Save, Settings } from "lucide-react"
import type React from "react"
import { useCallback, useRef, useState } from "react"
import type { AppAction, AppNode } from "@/client/features/types"
import { serializeAppStateAsHtml, validateHtmlExport, ValidationDialog, type ValidationResult } from "@/client/features/serializers"
import { toast } from "@/client/components/ui/use-toast"

type ToolbarSettingsPopoverProps = Readonly<{
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  toolbarLayout: "horizontal" | "vertical"
  onToolbarLayoutChange: (layout: "horizontal" | "vertical") => void
  pageTitle: string
  onPageTitleChange: (title: string) => void
  pageComponent: AppNode
  children: React.ReactNode
  componentTree: ReadonlyArray<AppNode>
  dispatch: React.Dispatch<AppAction>
  promptAssistEnabled: boolean
  hasSelectedComponent?: boolean
}>

export const ToolbarSettingsPopover: React.FC<ToolbarSettingsPopoverProps> = ({
  isOpen,
  onOpenChange,
  toolbarLayout,
  onToolbarLayoutChange,
  pageTitle,
  onPageTitleChange,
  pageComponent,
  children,
  componentTree,
  dispatch,
  promptAssistEnabled,
  hasSelectedComponent = false,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isPositioned, setIsPositioned] = useState(false)
  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  const [pendingExportAction, setPendingExportAction] = useState<"preview" | "copy" | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

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
  }, [dragOffset.x, dragOffset.y, isDragging])

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const currentPage = pageComponent

  const runValidation = (action: "preview" | "copy") => {
    const validation = validateHtmlExport(componentTree, window.location.origin)
    setValidationResult(validation)
    setPendingExportAction(action)
    setValidationDialogOpen(true)
    onOpenChange(false)
  }

  const handleValidationProceed = () => {
    if (pendingExportAction === "preview") {
      const html = serializeAppStateAsHtml(componentTree, { assetBaseUrl: window.location.origin })
      const blob = new Blob([html], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const previewWindow = window.open(url, "_blank")
      if (!previewWindow) {
        toast({
          title: "Preview blocked",
          description: "Please allow popups for this site to preview the export.",
          variant: "destructive",
        })
        URL.revokeObjectURL(url)
      }
    } else if (pendingExportAction === "copy") {
      const html = serializeAppStateAsHtml(componentTree, { assetBaseUrl: window.location.origin })
      navigator.clipboard.writeText(html).then(
        () => {
          toast({
            title: "HTML copied",
            description: "Exported HTML has been copied to clipboard.",
          })
        },
        () => {
          toast({
            title: "Copy failed",
            description: "Failed to copy HTML to clipboard.",
            variant: "destructive",
          })
        },
      )
    }
    setValidationDialogOpen(false)
    setPendingExportAction(null)
    setValidationResult(null)
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn("w-72 p-0", isPositioned && "fixed z-50", isDragging && "cursor-grabbing")}
        align="start"
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
        <div ref={popoverRef} className="bg-background border rounded-lg shadow-lg">
          <div
            className={cn(
              "bg-foreground text-background p-4 rounded-t-lg flex items-center justify-between cursor-grab active:cursor-grabbing",
              isDragging && "cursor-grabbing",
            )}
            onMouseDown={handleMouseDown}
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </h2>
            <GripVertical className="h-4 w-4 opacity-60" />
          </div>

          <div className="p-4 space-y-4">
            {!hasSelectedComponent && (
              <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 p-3 text-sm text-muted-foreground" role="status">
                No component is selected. Click a component on the canvas to select it, then use Settings to edit it. Page settings are below.
              </div>
            )}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Page</h3>
              <div className="space-y-2">
                <label htmlFor="page-title" className="text-sm font-medium">
                  Page Title
                </label>
                <input
                  id="page-title"
                  type="text"
                  value={pageTitle}
                  onChange={(e) => onPageTitleChange(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter page title"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="page-description" className="text-sm font-medium">
                  Description (SEO)
                </label>
                <textarea
                  id="page-description"
                  value={currentPage?.attributes.description ?? ""}
                  onChange={(e) => dispatch({ type: "UPDATE_COMPONENT", payload: { componentId: currentPage?.attributes.id ?? "", updates: { attributes: { description: e.target.value } } } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter page description for SEO"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="page-favicon" className="text-sm font-medium">
                  Favicon URL
                </label>
                <input
                  id="page-favicon"
                  type="url"
                  value={currentPage?.attributes.favicon ?? ""}
                  onChange={(e) => dispatch({ type: "UPDATE_COMPONENT", payload: { componentId: currentPage?.attributes.id ?? "", updates: { attributes: { favicon: e.target.value } } } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="page-og-image" className="text-sm font-medium">
                  Open Graph Image
                </label>
                <input
                  id="page-og-image"
                  type="url"
                  value={currentPage?.attributes.ogImage ?? ""}
                  onChange={(e) => dispatch({ type: "UPDATE_COMPONENT", payload: { componentId: currentPage?.attributes.id ?? "", updates: { attributes: { ogImage: e.target.value } } } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="https://example.com/og-image.png"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="page-canonical-url" className="text-sm font-medium">
                  Canonical URL
                </label>
                <input
                  id="page-canonical-url"
                  type="url"
                  value={currentPage?.attributes.canonicalUrl ?? ""}
                  onChange={(e) => dispatch({ type: "UPDATE_COMPONENT", payload: { componentId: currentPage?.attributes.id ?? "", updates: { attributes: { canonicalUrl: e.target.value } } } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="https://example.com/page"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="page-custom-head" className="text-sm font-medium">
                  Custom {"<head>"} HTML
                </label>
                <textarea
                  id="page-custom-head"
                  value={Array.isArray(currentPage?.attributes.customHead) ? currentPage.attributes.customHead.join("\n") : (currentPage?.attributes.customHead ?? "")}
                  onChange={(e) => dispatch({ type: "UPDATE_COMPONENT", payload: { componentId: currentPage?.attributes.id ?? "", updates: { attributes: { customHead: e.target.value.split("\n").join("\n") } } } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono text-xs"
                  placeholder={`<meta name="analytics" content="...">&#10;<link rel="preconnect" href="https://fonts.googleapis.com">`}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="page-custom-css" className="text-sm font-medium">
                  Custom CSS
                </label>
                <textarea
                  id="page-custom-css"
                  value={Array.isArray(currentPage?.attributes.customCss) ? currentPage.attributes.customCss.join("\n") : (currentPage?.attributes.customCss ?? "")}
                  onChange={(e) => dispatch({ type: "UPDATE_COMPONENT", payload: { componentId: currentPage?.attributes.id ?? "", updates: { attributes: { customCss: e.target.value.split("\n").join("\n") } } } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono text-xs"
                  placeholder={`/* Custom styles injected in export *&#47;&#10;:root { --custom-color: #123; }`}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="page-custom-js" className="text-sm font-medium">
                  Custom JavaScript
                </label>
                <textarea
                  id="page-custom-js"
                  value={Array.isArray(currentPage?.attributes.customJs) ? currentPage.attributes.customJs.join("\n") : (currentPage?.attributes.customJs ?? "")}
                  onChange={(e) => dispatch({ type: "UPDATE_COMPONENT", payload: { componentId: currentPage?.attributes.id ?? "", updates: { attributes: { customJs: e.target.value.split("\n").join("\n") } } } })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono text-xs"
                  placeholder={`// Custom JS injected in export&#10;console.log('Page loaded');`}
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Toolbar</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Layout</label>
                <div className="flex gap-2">
                  <Button
                    variant={toolbarLayout === "horizontal" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => onToolbarLayoutChange("horizontal")}
                  >
                    <LayoutDashboard className="h-3 w-3 mr-1" />
                    Horizontal
                  </Button>
                  <Button
                    variant={toolbarLayout === "vertical" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => onToolbarLayoutChange("vertical")}
                  >
                    <GripVertical className="h-3 w-3 mr-1" />
                    Vertical
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shortcuts</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Keyboard className="h-3 w-3 shrink-0" />
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">⌘K</kbd>
                  <span>Command Palette</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Keyboard className="h-3 w-3 shrink-0" />
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">⌘S</kbd>
                  <span>Save Page</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Keyboard className="h-3 w-3 shrink-0" />
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">⌘Z</kbd>
                  <span>Undo</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Keyboard className="h-3 w-3 shrink-0" />
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">⌘⇧Z</kbd>
                  <span>Redo</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Assistant</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promptAssistEnabled}
                    onChange={(e) => dispatch({ type: "SET_PROMPT_ASSIST_ENABLED", payload: e.target.checked })}
                    className="h-4 w-4 rounded border-input bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <span className="text-sm font-medium">Enable AI Assistant</span>
                </label>
                <p className="text-xs text-muted-foreground ml-6">
                  When enabled, the AI Assistant chat bubble appears in the bottom-right corner.
                  Use it to describe a page and get a template with drafted content and tuned design.
                </p>
                <div className="text-xs text-muted-foreground ml-6 space-y-1 border-l border-muted/50 pl-3">
                  <p><strong>How to use:</strong></p>
                  <p>1. Click the <Bot className="h-3 w-3 inline-block align-middle mr-1" /> button in the toolbar or press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘K</kbd> and search "Open AI Assistant"</p>
                  <p>2. Describe the page you want in plain language (e.g., "A landing page for a coffee shop with menu and contact info")</p>
                  <p>3. The assistant picks a template, drafts copy, and tunes the design</p>
                  <p>4. Review the proposal and click "Apply" to add it to your page</p>
                  <p><strong>Requires:</strong> Deployment flag <code className="bg-muted px-1 rounded">NEXT_PUBLIC_PROMPT_ASSIST_ENABLED=1</code> and an AI provider (TypeSafe Jev or OpenAI) configured in <code className="bg-muted px-1 rounded">.env.local</code></p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</h3>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => onOpenChange(false)}>
                  <Palette className="h-4 w-4" />
                  Browse Templates
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => runValidation("preview")}>
                  <Eye className="h-4 w-4" />
                  Preview Export
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => runValidation("copy")}>
                  <Copy className="h-4 w-4" />
                  Copy HTML to Clipboard
                </Button>
                <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => onOpenChange(false)}>
                  <Download className="h-4 w-4" />
                  Download as HTML
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>

      <ValidationDialog
        validation={validationResult ?? { issues: [], hasErrors: false, hasWarnings: false }}
        onProceed={handleValidationProceed}
        onCancel={() => {
          setValidationDialogOpen(false)
          setPendingExportAction(null)
          setValidationResult(null)
        }}
        isOpen={validationDialogOpen}
        onOpenChange={setValidationDialogOpen}
      />
    </Popover>
  )
}