"use client"

import { Toolbar } from "@/components/page-builder/toolbar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Component as PageComponent } from "@/features/design-components/page-component"
import type { DesignComponent } from "@/features/design-components/types"
import type { PageBuilderMode } from "@/lib/store/types"
import { ComponentOperationsContext } from "@/lib/component-operations-context"
import { useAppState, useComponentOperations, useHistoryOperations, usePageOperations } from "@/lib/store/hooks"
import { ChevronDown, Download, Layers, Upload } from "lucide-react"
import Link from "next/link"
import React, { useRef, useState } from "react"

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

  // Get the current active page
  const currentPage = (state.componentTree.find((page) => page.attributes.id === state.activePage) || state.componentTree[0]) as DesignComponent<"page">

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

        // Add to history
        setTimeout(() => {
          dispatch({
            type: "ADD_TO_HISTORY",
            payload: {
              action: "Loaded page",
              pageState: state.componentTree,
            },
          })
        }, 0)
      },
    })

    // Reset the file input
    if (event.target.type === "file") {
      event.target.value = ""
    }
  }

  return (
    <ComponentOperationsContext.Provider value={componentOperations}>
      <div className="flex flex-col min-h-screen">
        <header className="border-b px-2">
          <div className="container flex items-center justify-between py-4 mx-auto">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Layers className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">LivePage</h1>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu open={loadDropdownOpen} onOpenChange={setLoadDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" /> Import
                    <ChevronDown className="h-3 w-3" />
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
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> Export
                    <ChevronDown className="h-3 w-3" />
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
                className="gap-2"
                onClick={() => dispatch({ type: "SET_PAGE_BUILDER_MODE", payload: pageBuilderMode === "edit" ? "preview" : "edit" })}
              >
                {pageBuilderMode === "edit" ? "Switch to Preview Mode" : "Switch to Edit Mode"}
              </Button>
            </div>
          </div>
        </header>

        <PageComponent
          selectedComponentId={state.selectedComponentId}
          selectedComponentAncestors={state.selectedComponentAncestors}
          pageBuilderMode={pageBuilderMode as PageBuilderMode}
          component={currentPage}
        />

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
        />
      </div>
    </ComponentOperationsContext.Provider>
  )
}