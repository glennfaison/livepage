"use client"

import { PageBuilderErrorBoundary } from "@/client/components/error-boundary"
import { CanvasRenderer } from "@/client/features/page-builder"
import { DragDropProvider } from "@/client/features/design-components/editor-controls"
import { getComponentTemplateById } from "@/client/features/templates/component-registry"
import { ChevronLeft, Layers } from "lucide-react"
import Link from "next/link"
import React from "react"
import { useParams } from "next/navigation"

export default function ComponentTemplatePreviewPage() {
  const params = useParams()
  const componentTemplateId = params.componentTemplateId as string
  const template = getComponentTemplateById(componentTemplateId)

  if (!template) {
    return <div className="p-8 text-center">Component template not found.</div>
  }

  const root = JSON.parse(JSON.stringify(template.content.root))

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 py-3">
        <div className="container mx-auto flex items-center gap-2">
          <Link href="/try" className="flex items-center gap-2">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">Back to Builder</span>
          </Link>
          <span className="h-5 w-px bg-border" />
          <Layers className="h-6 w-6" />
          <h1 className="text-xl font-bold">Preview: {template.metadata.name}</h1>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <PageBuilderErrorBoundary>
          <DragDropProvider moveComponent={() => {}}>
            <CanvasRenderer node={root} />
          </DragDropProvider>
        </PageBuilderErrorBoundary>
      </main>
    </div>
  )
}
