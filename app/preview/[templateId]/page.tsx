"use client"

import { Button } from "@/client/components/ui/button"
import { selectCurrentPage } from "@/client/features/app-state"
import { useAppState } from "@/client/features/app-state"
import {
  CanvasRenderer,
  ComponentOperationsContext,
  type Operations,
} from "@/client/features/page-builder"
import { getPageTemplateById } from "@/client/features/templates"
import { createApplyTemplateActions } from "@/client/features/templates/actions"
import { Link } from "next/link"
import React, { useEffect } from "react"
import { ChevronLeft, ExternalLink, Layers, Pencil } from "lucide-react"
import { PageBuilderErrorBoundary } from "@/client/components/error-boundary"
import { DragDropProvider } from "@/client/features/design-components/editor-controls"

export default function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ templateId: string }>
}) {
  const { state, dispatch } = useAppState()
  const [templateId, setTemplateId] = React.useState<string>("")
  const [templateName, setTemplateName] = React.useState<string>("")

  useEffect(() => {
    params.then((p) => {
      const id = p.templateId
      setTemplateId(id)
      const template = getPageTemplateById(id)
      if (template) {
        setTemplateName(template.metadata.name)
        for (const action of createApplyTemplateActions(template)) {
          dispatch(action)
        }
      }
      dispatch({ type: "SET_PAGE_BUILDER_MODE", payload: "preview" })
    })
  }, [dispatch, params])

  const currentPage = selectCurrentPage(state) ?? state.componentTree[0]

  const applyTemplate = (id: string) => {
    const template = getPageTemplateById(id)
    if (!template) return
    for (const action of createApplyTemplateActions(template)) {
      dispatch(action)
    }
    setTemplateId(id)
    setTemplateName(template.metadata.name)
  }

  return (
    <ComponentOperationsContext.Provider value={{} as Operations}>
      <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background">
        <header className="border-b px-4 py-3">
          <div className="container mx-auto flex min-w-0 flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Link href="/try" className="flex min-w-0 items-center gap-2">
                <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Back to Builder</span>
              </Link>
              <span className="h-5 w-px bg-border" />
              <Link href="/" className="flex min-w-0 items-center gap-2">
                <Layers className="h-6 w-6 shrink-0 text-primary" />
                <h1 className="truncate text-xl font-bold">LivePage</h1>
              </Link>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
              <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
                Preview: <strong>{templateName}</strong>
              </span>
              <Button
                variant="default"
                size="sm"
                className="gap-2 px-3"
                onClick={() => window.open(`/try?template=${templateId}&mode=edit`, "_blank")}
                aria-label="Open in builder"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Open in Builder</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 px-3"
                onClick={() => applyTemplate(templateId)}
                aria-label="Apply template"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Apply Template</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col">
          <PageBuilderErrorBoundary>
            <DragDropProvider moveComponent={() => {}}>
              <CanvasRenderer
                component={currentPage}
                pageBuilderMode="preview"
                selectedComponentId={null}
                selectedComponentAncestors={[]}
              />
            </DragDropProvider>
          </PageBuilderErrorBoundary>
        </main>
      </div>
    </ComponentOperationsContext.Provider>
  )
}