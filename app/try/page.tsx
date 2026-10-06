"use client"

import { Button } from "@/client/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/client/components/ui/dropdown-menu"
import { selectCurrentPage } from "@/client/features/app-state"
import type { PageBuilderMode } from "@/client/features/app-state"
import { useAppState } from "@/client/features/app-state"
import {
  CanvasRenderer,
  ComponentOperationsContext,
  Toolbar,
  useComponentOperations,
  useHistoryOperations,
  usePageOperations,
} from "@/client/features/page-builder"
import { createApplyTemplateActions, describeTemplateDisplayCatalog, getPageTemplateById, TemplateCatalogPopover, useTemplateDeepLink } from "@/client/features/templates"
import { CommandPalette, useCommandPaletteShortcut } from "@/client/features/command-palette"
import { AssistChat } from "@/client/features/prompt-assist"
import { ThemeToggle } from "@/client/components/theme-toggle"
import { PageBuilderErrorBoundary } from "@/client/components/error-boundary"
import { ChevronDown, Command, Download, Layers, MonitorPlay, Pencil, Upload } from "lucide-react"
import Link from "next/link"
import React, { useRef, useState } from "react"
import { Input } from "@/client/components/ui/input"
import { DragDropProvider } from "@/client/features/design-components/editor-controls"

const templateDisplayCatalog = describeTemplateDisplayCatalog()

export default function BuilderPage() {
  const { state, dispatch } = useAppState()
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

  // Global shortcut works in both edit and preview mode.
  useCommandPaletteShortcut(setCommandPaletteOpen)

  // Deep link used by template review: /try?template=<id>&mode=preview renders a template deterministically.
  useTemplateDeepLink(dispatch)

  // Get the current active page
  const currentPage = selectCurrentPage(state) ?? state.componentTree[0]
  const updatePageTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentPage) return
    componentOperations.updateComponent(currentPage.attributes.id, {
      attributes: { title: e.target.value },
    })
  }

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

  const canUndo = state.currentHistoryIndex > 0
  const canRedo = state.currentHistoryIndex < state.history.length - 1

  const handleUndo = () => {
    if (canUndo) {
      dispatch({
        type: "SET_PAGES",
        payload: JSON.parse(JSON.stringify(state.history[state.currentHistoryIndex - 1].pageState)),
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
        payload: JSON.parse(JSON.stringify(state.history[state.currentHistoryIndex + 1].pageState)),
      })
      dispatch({ type: "SET_CURRENT_HISTORY_INDEX", payload: state.currentHistoryIndex + 1 })
      dispatch({ type: "SET_HISTORY_PREVIEW_INDEX", payload: null })
      dispatch({ type: "SET_ORIGINAL_HISTORY_STATE", payload: null })
    }
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
                aria-label="Open command palette"
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
                className="hidden"
              />
              <input
                type="file"
                ref={shortcodeFileInputRef}
                onChange={(e) => loadPage(e, "shortcode")}
                accept=".txt"
                className="hidden"
              />

              <DropdownMenu open={saveDropdownOpen} onOpenChange={setSaveDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 px-2 sm:px-3" aria-label="Export page">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
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
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 px-2 sm:px-3"
                aria-label={pageBuilderMode === "edit" ? "Switch to preview mode" : "Switch to edit mode"}
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
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col">
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
                    defaultValue={currentPage?.attributes.title ?? ""}
                    onChange={updatePageTitle}
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
            <DragDropProvider moveComponent={componentOperations.moveComponent ?? (() => {})}>
              <CanvasRenderer
                component={currentPage}
                pageBuilderMode={pageBuilderMode}
                selectedComponentId={state.selectedComponentId}
                selectedComponentAncestors={state.selectedComponentAncestors}
              />
            </DragDropProvider>
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
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          pageComponent={currentPage}
          onPageTitleChange={(title) => componentOperations.updateComponent(currentPage?.attributes.id ?? "", { attributes: { title } })}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

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
          onImportJson={() => jsonFileInputRef.current?.click()}
          onImportShortcode={() => shortcodeFileInputRef.current?.click()}
          onDiscardChanges={handleDiscard}
        />

        <AssistChat dispatch={dispatch} />
      </div>
    </ComponentOperationsContext.Provider>
  )
}
