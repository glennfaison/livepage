"use client"

import React, { useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Layers, Upload, Download, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PageCraftToolbar } from "@/components/page-builder/pagecraft-toolbar"
import { useAppState, usePageOperations, useComponentOperations, useHistoryOperations } from "@/lib/store/hooks"
import type { PageBuilderMode } from "@/features/design-components/types"
import { Component as PageComponent } from "@/features/design-components/page-component"

export default function BuilderPage() {
  const { state, dispatch } = useAppState()
  const pageBuilderMode = state.pageBuilderMode
  const { savePageAsJsonMutation, loadPageMutation, savePageAsHtmlMutation, savePageAsShortcodeMutation } = usePageOperations()

  const { addComponent, updateComponent, removeComponent, duplicateComponent, replaceComponent, setSelectedComponent } =
    useComponentOperations(dispatch, state)
  const { handleSelectHistory, handleHistoryAccept, handleHistoryDiscard, handleDiscard } = useHistoryOperations(
    dispatch,
    state,
  )

  const jsonFileInputRef = useRef<HTMLInputElement>(null)
  const shortcodeFileInputRef = useRef<HTMLInputElement>(null)
  const [saveDropdownOpen, setSaveDropdownOpen] = useState(false)
  const [loadDropdownOpen, setLoadDropdownOpen] = useState(false)

  // Get the current active page
  const currentPage = state.pages.find((page) => page.id === state.activePage) || state.pages[0]

  const saveAsJSON = () => {
    savePageAsJsonMutation.mutate(currentPage)
    setSaveDropdownOpen(false)
  }

  const saveAsShortcode = () => {
    savePageAsShortcodeMutation.mutate(currentPage)
    setSaveDropdownOpen(false)
  }

  const saveAsHTML = () => {
    savePageAsHtmlMutation.mutate(currentPage)
    setSaveDropdownOpen(false)
  }

  // Load a page from a file
  const loadPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    loadPageMutation.mutate(file, {
      onSuccess: (loadedPage) => {
        // Check if the page already exists
        const existingPageIndex = state.pages.findIndex((p) => p.id === loadedPage.id)

        if (existingPageIndex >= 0) {
          // Update existing page
          dispatch({
            type: "UPDATE_PAGE",
            payload: { id: loadedPage.id, updates: loadedPage },
          })
        } else {
          // Add as a new page
          dispatch({ type: "ADD_PAGE", payload: loadedPage })
        }

        dispatch({ type: "SET_ACTIVE_PAGE", payload: loadedPage.id })

        // Add to history
        setTimeout(() => {
          dispatch({
            type: "ADD_TO_HISTORY",
            payload: {
              action: "Loaded page",
              pageState: state.pages,
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
    <div className="flex flex-col min-h-screen">
      <header className="border-b px-2">
        <div className="container flex items-center justify-between py-4 mx-auto">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">PageCraft</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu open={loadDropdownOpen} onOpenChange={setLoadDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" /> Load
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => jsonFileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Load JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shortcodeFileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Load Shortcode
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              type="file"
              ref={jsonFileInputRef}
              onChange={loadPage}
              accept=".json"
              className="hidden"
            />
            <input
              type="file"
              ref={shortcodeFileInputRef}
              onChange={loadPage}
              accept=".txt"
              className="hidden"
            />

            <DropdownMenu open={saveDropdownOpen} onOpenChange={setSaveDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" /> Save
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
                  {savePageAsJsonMutation.isPending ? "Saving..." : "Download as JSON"}
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
        pageBuilderMode={pageBuilderMode as PageBuilderMode}
        component={currentPage}
        selectedComponentId={state.selectedComponentId}
        addComponent={addComponent}
        updateComponent={updateComponent}
        removeComponent={removeComponent}
        duplicateComponent={duplicateComponent}
        replaceComponent={replaceComponent}
        setSelectedComponent={setSelectedComponent}
      />

      <PageCraftToolbar
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
  )
}