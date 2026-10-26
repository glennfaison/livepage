"use client"

import { Button } from "@/client/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/client/components/ui/dropdown-menu"
import { selectCurrentPage } from "@/client/features/app-state"
import { recoverLoadLatest, recoverOverwrite } from "@/client/features/app-state"
import type { PageBuilderMode } from "@/client/features/app-state"
import { useAppState } from "@/client/features/app-state"
import { deepClone } from "@/client/lib/deep-clone"
import { cn } from "@/client/lib/utils"
import {
  CanvasRenderer,
  ComponentOperationsContext,
  Toolbar,
  useComponentOperations,
  useHistoryOperations,
  usePageOperations,
} from "@/client/features/page-builder"
import {
  useCopyComponentShortcut,
  usePasteComponentShortcut,
  useDuplicateComponentShortcut,
} from "@/client/features/page-builder/keyboard-shortcuts"
import { createApplyTemplateActions, describeTemplateDisplayCatalog, getPageTemplateById, TemplateCatalogPopover, useTemplateDeepLink } from "@/client/features/templates"
import { CommandPalette, useCommandPaletteShortcut } from "@/client/features/command-palette"
import { AssistChat } from "@/client/features/prompt-assist"
import { OnboardingWalkthrough } from "@/client/features/page-builder/onboarding-walkthrough"
import { ThemeToggle } from "@/client/components/theme-toggle"
import { PageBuilderErrorBoundary } from "@/client/components/error-boundary"
import { ChevronDown, Command, Copy, Download, Eye, Layers, Loader2, MonitorPlay, Pencil, Upload, Monitor } from "lucide-react"
import Link from "next/link"
import React, { useCallback, useRef, useState, useMemo, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select"
import { Input } from "@/client/components/ui/input"
import { DragDropProvider } from "@/client/features/design-components/editor-controls"
import { usePageTitleDraft } from "@/client/features/page-builder/page-title-draft"
import { serializeAppStateAsHtml, serializeAppStateAsJson, validateHtmlExport, ValidationDialog, type ValidationResult } from "@/client/features/serializers"
import { toast } from "@/client/components/ui/use-toast"

const templateDisplayCatalog = describeTemplateDisplayCatalog()

function StaleLockBanner({
  onLoadLatest,
  onExport,
  onOverwrite,
}: Readonly<{
  onLoadLatest: () => void
  onExport: () => void
  onOverwrite: () => void
}>): React.JSX.Element {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="fixed inset-x-0 top-0 z-50 p-4 sm:p-6 sm:rounded-b-lg"
    >
      <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg">
        <h2 className="text-sm font-semibold text-amber-900">Edited in another tab</h2>
        <p className="mt-1 text-sm text-amber-800">
          This tab is out of date and has been locked to protect your edits. Your changes are still
          in memory and have not been saved.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 sm:gap-4">
          <Button variant="default" onClick={onLoadLatest} className="flex-1 sm:auto">
            Load latest here
          </Button>
          <Button variant="outline" onClick={onExport} className="flex-1 sm:auto">
            Export my version
          </Button>
          <Button variant="destructive" onClick={onOverwrite} className="flex-1 sm:auto">
            Overwrite with this tab
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function BuilderPage() {
  const { state, dispatch } = useAppState()
  const isStale = state.stale
  const pageBuilderMode = state.pageBuilderMode
  const {
    savePageAsJsonMutation,
    loadPageFromJsonMutation,
    loadPageFromShortcodeMutation,
    savePageAsHtmlMutation,
    savePageAsShortcodeMutation
  } = usePageOperations(state)
  const {
    handleSelectHistory,
    handleHistoryAccept,
    handleHistoryDiscard,
    handleDiscard
  } = useHistoryOperations(dispatch, state)
  const componentOperations = useComponentOperations(dispatch, state)

  const jsonFileInputRef = useRef<HTMLInputElement>(null)
  const shortcodeFileInputRef = useRef<HTMLInputElement>(null)
  const [saveDropdownOpen, setSaveDropdownOpen] = useState(false)
  const [loadDropdownOpen, setLoadDropdownOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  const [pendingExportAction, setPendingExportAction] = useState<"preview" | "copy" | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")

  // Global shortcut works in both edit and preview mode.
  useCommandPaletteShortcut(setCommandPaletteOpen)

  // Component copy / paste / duplicate (edit mode only, when a component is selected)
  const hasSelection = Boolean(state.selectedComponentId)
  useCopyComponentShortcut(
    () => componentOperations.copyComponentToClipboard?.(state.selectedComponentId),
    pageBuilderMode === "edit" && hasSelection,
  )
  usePasteComponentShortcut(
    () => componentOperations.pasteComponentFromClipboard?.(state.selectedComponentId),
    pageBuilderMode === "edit" && hasSelection,
  )
  useDuplicateComponentShortcut(
    () => componentOperations.duplicateComponent?.(state.selectedComponentId),
    pageBuilderMode === "edit" && hasSelection,
  )

  // Deep link used by template review: /try?template=<id>&mode=preview renders a template deterministically.
  useTemplateDeepLink(dispatch)

  // Get the current active page
  const currentPage = selectCurrentPage(state) ?? state.componentTree[0]
  const commitPageTitle = useCallback(
    (title: string) => {
      if (!currentPage) return
      componentOperations.updateComponent(currentPage.attributes.id, {
        attributes: { title },
      })
    },
    [componentOperations, currentPage],
  )
  // Edit the title locally and only write it on Enter/blur: saving per keystroke
  // pushes a history entry for every character.
  const pageTitleDraft = usePageTitleDraft(currentPage?.attributes?.title ?? "", commitPageTitle)

  const saveAsJSON = () => {
    savePageAsJsonMutation.mutate(state.componentTree)
    setSaveDropdownOpen(false)
  }

  const saveAsShortcode = () => {
    savePageAsShortcodeMutation.mutate(state.componentTree)
    setSaveDropdownOpen(false)
  }

  const saveAsHTML = () => {
    savePageAsHtmlMutation.mutate(state.componentTree)
    setSaveDropdownOpen(false)
  }

  const saveAsSelfContainedHTML = () => {
    savePageAsHtmlMutation.mutate({ componentTree: state.componentTree, selfContained: true })
    setSaveDropdownOpen(false)
  }

  const previewExport = () => {
    const validation = validateHtmlExport(state.componentTree, window.location.origin)
    if (!validation.hasErrors && !validation.hasWarnings) {
      handleValidationProceedForAction("preview")
      return
    }
    setValidationResult(validation)
    setPendingExportAction("preview")
    setValidationDialogOpen(true)
    setSaveDropdownOpen(false)
  }

  const copyHtmlToClipboard = () => {
    const validation = validateHtmlExport(state.componentTree, window.location.origin)
    if (!validation.hasErrors && !validation.hasWarnings) {
      handleValidationProceedForAction("copy")
      return
    }
    setValidationResult(validation)
    setPendingExportAction("copy")
    setValidationDialogOpen(true)
    setSaveDropdownOpen(false)
  }

  const handleValidationProceedForAction = (action: "preview" | "copy") => {
    if (action === "preview") {
      const html = serializeAppStateAsHtml(state.componentTree, { assetBaseUrl: window.location.origin })
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
    } else if (action === "copy") {
      const html = serializeAppStateAsHtml(state.componentTree, { assetBaseUrl: window.location.origin })
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
  }

  const handleValidationProceed = () => {
    if (pendingExportAction) {
      handleValidationProceedForAction(pendingExportAction)
    }
    setValidationDialogOpen(false)
    setPendingExportAction(null)
    setValidationResult(null)
  }

  const previewHtml = useMemo(() => {
    if (pageBuilderMode !== "preview" || previewDevice === "desktop") return null
    try {
      return serializeAppStateAsHtml(state.componentTree, { assetBaseUrl: typeof window !== "undefined" ? window.location.origin : undefined })
    } catch {
      return null
    }
  }, [pageBuilderMode, previewDevice, state.componentTree])

  const [iframeSrc, setIframeSrc] = useState<string | null>(null)
  useEffect(() => {
    if (!previewHtml) {
      setIframeSrc(null)
      return
    }
    const blob = new Blob([previewHtml], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    setIframeSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [previewHtml])

  const deviceWidth = previewDevice === "tablet" ? 768 : previewDevice === "mobile" ? 375 : undefined
  const canUndo = state.currentHistoryIndex > 0
  const canRedo = state.currentHistoryIndex < state.history.length - 1

  const anyExportPending =
    savePageAsJsonMutation.isPending ||
    savePageAsShortcodeMutation.isPending ||
    savePageAsHtmlMutation.isPending
  const anyImportPending =
    loadPageFromJsonMutation.isPending || loadPageFromShortcodeMutation.isPending

  const handleUndo = () => {
    if (canUndo) {
      dispatch({
        type: "SET_PAGES",
        payload: deepClone(state.history[state.currentHistoryIndex - 1].pageState),
      })
      dispatch({ type: "SET_CURRENT_HISTORY_INDEX", payload: state.currentHistoryIndex - 1 })
      dispatch({ type: "SET_HISTORY_PREVIEW_INDEX", payload: null })
      dispatch({ type: "SET_ORIGINAL_HISTORY_STATE", payload: null })
    }
  }

  const handleRedo = () => {
    if (canRedo) {
      dispatch({
        type: "SET_PAGES",
        payload: deepClone(state.history[state.currentHistoryIndex + 1].pageState),
      })
      dispatch({ type: "SET_CURRENT_HISTORY_INDEX", payload: state.currentHistoryIndex + 1 })
      dispatch({ type: "SET_HISTORY_PREVIEW_INDEX", payload: null })
      dispatch({ type: "SET_ORIGINAL_HISTORY_STATE", payload: null })
    }
  }

  const handleDuplicatePage = () => {
    componentOperations.duplicatePage?.()
  }

  const applyTemplate = (templateId: string) => {
    const template = getPageTemplateById(templateId)
    if (!template) {
      return
    }

    for (const action of createApplyTemplateActions(template)) {
      dispatch(action)
    }
  }

  // Load a page from a file
  const loadPage = (event: React.ChangeEvent<HTMLInputElement>, uploadType: "json" | "shortcode") => {
    const file = event.target.files?.[0]
    if (!file) return

    const loadPageMutation = uploadType === "json" ? loadPageFromJsonMutation : loadPageFromShortcodeMutation
    loadPageMutation.mutate(file, {
      onSuccess: (loadedComponentTree) => {
        const currentPage = componentOperations.findComponentById(loadedComponentTree, state.activePage)

        dispatch({ type: "SET_PAGES", payload: loadedComponentTree })
        dispatch({ type: "SET_ACTIVE_PAGE", payload: currentPage?.attributes.id || "" })
        dispatch({
          type: "ADD_TO_HISTORY",
          payload: {
            action: "Loaded page",
            pageState: loadedComponentTree,
          },
        })
      },
    })

    // Reset the file input
    if (event.target.type === "file") {
      event.target.value = ""
    }
  }

  return (
    <ComponentOperationsContext.Provider value={componentOperations}>
      <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip">
        {isStale && (
          <StaleLockBanner
            onLoadLatest={() => {
              recoverLoadLatest()
            }}
            onExport={() => {
              const data = serializeAppStateAsJson(state.componentTree)
              const blob = new Blob([data], { type: "application/json" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `${(selectCurrentPage(state)?.attributes.title ?? "page").toLowerCase().replace(/\s+/g, "-") || "page"}.json`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }}
            onOverwrite={() => {
              recoverOverwrite()
            }}
          />
        )}
        <header className="border-b px-2">
          <div className="container mx-auto flex min-w-0 flex-wrap items-center justify-between gap-2 py-3 sm:py-4">
            <div className="flex min-w-0 items-center gap-2">
              <Link href="/" className="flex min-w-0 items-center gap-2">
                <Layers className="h-6 w-6 shrink-0 text-primary" />
                <h1 className="truncate text-xl font-bold">LivePage</h1>
              </Link>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 px-2 sm:px-3"
                onClick={() => setCommandPaletteOpen(true)}
                title="Command palette (⌘K)"
                aria-label="Open command palette" data-onboarding="command"
              >
                <Command className="h-4 w-4" />
                <span className="hidden sm:inline">Command</span>
              </Button>
              <TemplateCatalogPopover templates={templateDisplayCatalog} onApplyTemplate={applyTemplate} />
              <DropdownMenu open={loadDropdownOpen} onOpenChange={setLoadDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 px-2 sm:px-3" aria-label="Import page">
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Import</span>
                    <ChevronDown className="hidden h-3 w-3 sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => shortcodeFileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Shortcode
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => jsonFileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                type="file"
                ref={jsonFileInputRef}
                onChange={(e) => loadPage(e, "json")}
                accept=".json"
                disabled={anyImportPending}
                className="hidden"
              />
              <input
                type="file"
                ref={shortcodeFileInputRef}
                onChange={(e) => loadPage(e, "shortcode")}
                accept=".txt"
                disabled={anyImportPending}
                className="hidden"
              />

              <DropdownMenu open={saveDropdownOpen} onOpenChange={setSaveDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 px-2 sm:px-3"
                    disabled={anyExportPending}
                    aria-label="Export page"
                  >
                    {anyExportPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{anyExportPending ? "Exporting..." : "Export"}</span>
                    <ChevronDown className="hidden h-3 w-3 sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={saveAsShortcode} disabled={savePageAsShortcodeMutation.isPending}>
                    <Download className="h-4 w-4 mr-2" />
                    {savePageAsShortcodeMutation.isPending ? "Exporting..." : "Download as Shortcode"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={saveAsJSON} disabled={savePageAsJsonMutation.isPending}>
                    <Download className="h-4 w-4 mr-2" />
                    {savePageAsJsonMutation.isPending ? "Exporting..." : "Download as JSON"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={saveAsHTML} disabled={savePageAsHtmlMutation.isPending}>
                    <Download className="h-4 w-4 mr-2" />
                    {savePageAsHtmlMutation.isPending ? "Exporting..." : "Download as HTML"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={saveAsSelfContainedHTML} disabled={savePageAsHtmlMutation.isPending}>
                    <Download className="h-4 w-4 mr-2" />
                    {savePageAsHtmlMutation.isPending ? "Exporting..." : "Download self-contained HTML"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={previewExport}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Export
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyHtmlToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy HTML to Clipboard
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 px-2 sm:px-3"
                aria-label={pageBuilderMode === "edit" ? "Switch to preview mode" : "Switch to edit mode"} data-onboarding="mode-toggle"
                title={pageBuilderMode === "edit" ? "Switch to preview mode" : "Switch to edit mode"}
                onClick={() => {
                  const nextMode = pageBuilderMode === "edit" ? "preview" : "edit"
                  dispatch({ type: "SET_PAGE_BUILDER_MODE", payload: nextMode })
                  const url = new URL(window.location.href)
                  url.searchParams.set("mode", nextMode)
                  window.history.replaceState(window.history.state, "", url)
                }}
              >
                {pageBuilderMode === "edit" ? <MonitorPlay className="h-4 w-4 sm:hidden" /> : <Pencil className="h-4 w-4 sm:hidden" />}
                <span className="hidden sm:inline">{pageBuilderMode === "edit" ? "Switch to Preview Mode" : "Switch to Edit Mode"}</span>
              </Button>
              {pageBuilderMode === "preview" && (
                <Select value={previewDevice} onValueChange={(value) => setPreviewDevice(value as "desktop" | "tablet" | "mobile")}>
                  <SelectTrigger className="w-[140px] h-9" aria-label="Preview device size">
                    <SelectValue placeholder="Device" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">
                      <span className="flex items-center gap-2"><Monitor className="h-4 w-4" /> Desktop</span>
                    </SelectItem>
                    <SelectItem value="tablet">
                      <span className="flex items-center gap-2"><Monitor className="h-4 w-4" /> Tablet (768px)</span>
                    </SelectItem>
                    <SelectItem value="mobile">
                      <span className="flex items-center gap-2"><MonitorPlay className="h-4 w-4" /> Mobile (375px)</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main data-onboarding="canvas" className={cn("flex-1 overflow-hidden flex flex-col", isStale ? "inert opacity-50 pointer-events-none" : "")}>
          <div className="border-b bg-background">
            <div className="container mx-auto flex min-w-0 flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 flex-1 basis-full items-center gap-3 sm:basis-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Pencil className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Editing page</p>
                  <Input
                    key={currentPage?.attributes.id}
                    value={pageTitleDraft.value}
                    onChange={(e) => pageTitleDraft.changeDraft(e.target.value)}
                    onKeyDown={pageTitleDraft.handleKeyDown}
                    onBlur={pageTitleDraft.handleBlur}
                    aria-label="Page title"
                    className="h-8 w-full min-w-0 max-w-full border-0 bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0 sm:max-w-sm"
                    id="page-title"
                    placeholder="Page Title"
                  />
                </div>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
                  {pageBuilderMode === "edit" ? <Pencil className="size-3.5" aria-hidden="true" /> : <MonitorPlay className="size-3.5" aria-hidden="true" />}
                  {pageBuilderMode === "edit" ? "Edit mode" : "Preview mode"}
                </span>
                <span className="hidden sm:inline">Changes are saved to history</span>
              </div>
            </div>
          </div>

          <PageBuilderErrorBoundary>
            {pageBuilderMode === "preview" && previewDevice !== "desktop" && iframeSrc ? (
              <div className="flex-1 flex items-start justify-center overflow-auto bg-muted/30 p-4">
                <div
                  className="relative bg-background border shadow-xl rounded-lg overflow-hidden"
                  style={{ width: deviceWidth, maxWidth: "100%", height: "calc(100dvh - 12rem)" }}
                >
                  <iframe
                    src={iframeSrc}
                    title={`${previewDevice} preview`}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                  />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                    {previewDevice === "tablet" ? "768px" : "375px"}
                  </div>
                </div>
              </div>
            ) : (
              <DragDropProvider moveComponent={componentOperations.moveComponent ?? (() => {})}>
                <CanvasRenderer
                  component={currentPage}
                  pageBuilderMode={pageBuilderMode}
                  selectedComponentId={state.selectedComponentId}
                  selectedComponentAncestors={state.selectedComponentAncestors}
                />
              </DragDropProvider>
            )}
          </PageBuilderErrorBoundary>
        </main>

        <Toolbar
          toolbarMinimized={state.toolbarMinimized}
          setToolbarMinimized={(minimized) => dispatch({ type: "SET_TOOLBAR_MINIMIZED", payload: minimized })}
          savePage={saveAsJSON}
          handleDiscard={handleDiscard}
          pageBuilderMode={pageBuilderMode as PageBuilderMode}
          history={state.history}
          currentHistoryIndex={state.currentHistoryIndex}
          onSelectHistory={handleSelectHistory}
          onAcceptHistory={handleHistoryAccept}
          onDiscardHistory={handleHistoryDiscard}
          historyPreviewIndex={state.historyPreviewIndex}
          onOpenAIAssistant={() => setAiAssistantOpen(true)}
          pageComponent={currentPage}
          componentTree={state.componentTree}
          onPageTitleChange={(title) => componentOperations.updateComponent(currentPage?.attributes.id ?? "", { attributes: { title } })}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDuplicatePage={handleDuplicatePage}
          dispatch={dispatch}
          promptAssistEnabled={state.promptAssistEnabled}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <OnboardingWalkthrough />
        <CommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
          state={state}
          dispatch={dispatch}
          componentOperations={componentOperations}
          templates={templateDisplayCatalog}
          onApplyTemplate={applyTemplate}
          onSaveAsJson={saveAsJSON}
          onSaveAsShortcode={saveAsShortcode}
          onSaveAsHtml={saveAsHTML}
          onSaveAsSelfContainedHtml={saveAsSelfContainedHTML}
          onPreviewExport={previewExport}
          onCopyHtml={copyHtmlToClipboard}
          onImportJson={() => jsonFileInputRef.current?.click()}
          onImportShortcode={() => shortcodeFileInputRef.current?.click()}
          isSavingJson={savePageAsJsonMutation.isPending}
          isSavingShortcode={savePageAsShortcodeMutation.isPending}
          isSavingHtml={savePageAsHtmlMutation.isPending}
          isLoadingJson={loadPageFromJsonMutation.isPending}
          isLoadingShortcode={loadPageFromShortcodeMutation.isPending}
          onDiscardChanges={handleDiscard}
          onOpenAIAssistant={() => setAiAssistantOpen(true)}
          onDuplicatePage={handleDuplicatePage}
          onToggleToolbar={() => dispatch({ type: "SET_TOOLBAR_MINIMIZED", payload: !state.toolbarMinimized })}
        />

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

        <AssistChat dispatch={dispatch} enabled={state.promptAssistEnabled} open={aiAssistantOpen} onOpenChange={setAiAssistantOpen} />
      </div>
    </ComponentOperationsContext.Provider>
  )
}
