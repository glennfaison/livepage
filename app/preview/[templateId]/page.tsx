"use client"

import { Button } from "@/client/components/ui/button"
import { PageBuilderErrorBoundary } from "@/client/components/error-boundary"
import { CanvasRenderer } from "@/client/features/page-builder"
import { DragDropProvider } from "@/client/features/design-components/editor-controls"
import { cloneTemplatePages, getPageTemplateById } from "@/client/features/templates"
import { ChevronLeft, ExternalLink, Layers, Pencil } from "lucide-react"
import Link from "next/link"
import React from "react"

function PreviewHeader({
  templateName,
  templateId,
}: Readonly<{ templateName: string; templateId: string }>) {
  return (
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
        {templateId && (
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
              asChild
            >
              <Link href={`/try?template=${templateId}&mode=edit`} aria-label="Apply template">
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Apply Template</span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

export default function TemplatePreviewPage({
  params,
}: Readonly<{
  params: Promise<{ templateId: string }>
}>) {
  const { templateId } = React.use(params)
  const template = getPageTemplateById(templateId ?? "")
  const previewPage = React.useMemo(
    () => (template ? cloneTemplatePages(template)[0] : undefined),
    [template],
  )

  if (!template || !previewPage) {
    return (
      <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background">
        <PreviewHeader templateId="" templateName="" />
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-16 text-center">
            <h2 className="text-lg font-semibold">Template not found</h2>
            <p className="text-sm text-muted-foreground">
              We could not find a template with id &ldquo;{templateId}&rdquo;.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/try">Back to Builder</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background">
      <PreviewHeader templateId={templateId} templateName={template.metadata.name} />
      <main className="flex-1 overflow-hidden flex flex-col">
        <PageBuilderErrorBoundary>
          <DragDropProvider moveComponent={() => {}}>
            <CanvasRenderer
              component={previewPage}
              pageBuilderMode="preview"
              selectedComponentId=""
              selectedComponentAncestors={[]}
            />
          </DragDropProvider>
        </PageBuilderErrorBoundary>
      </main>
    </div>
  )
}
