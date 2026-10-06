import React from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PreviewRenderer } from "@/client/features/design-components"
import { DataSourceErrorBoundary } from "@/client/components/error-boundary"
import type { AppNode } from "@/client/features/types"

const tree = JSON.parse(
  document.getElementById("livepage-data")?.textContent ?? "[]",
) as ReadonlyArray<AppNode>
const root = document.getElementById("livepage-root")

if (!root) throw new Error("Missing standalone HTML root")

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

createRoot(root).render(
  <QueryClientProvider client={queryClient}>
    {tree.map((component, index) => (
      <DataSourceErrorBoundary key={component.attributes.id ?? index} isPreviewMode={true}>
        <PreviewRenderer
          component={component}
          pageBuilderMode="preview"
          selectedComponentId=""
          selectedComponentAncestors={[]}
        />
      </DataSourceErrorBoundary>
    ))}
  </QueryClientProvider>,
)
