import type { AppAction, AppNode } from "@/client/features/types"
import { appNodeTreeSchema } from "@/client/features/serializers/schema"
import type { PageTemplateDefinition } from "@/client/features/templates/schema"

export function cloneTemplatePages(template: PageTemplateDefinition): ReadonlyArray<AppNode> {
  return appNodeTreeSchema.parse(JSON.parse(JSON.stringify(template.content.pages)))
}

export function createApplyTemplateActions(
  template: PageTemplateDefinition,
  options: Readonly<{
    customizePages?: (pages: ReadonlyArray<AppNode>) => ReadonlyArray<AppNode>
    historyLabel?: string
  }> = {},
): ReadonlyArray<AppAction> {
  const clonedPages = cloneTemplatePages(template)
  const pages = options.customizePages ? options.customizePages(clonedPages) : clonedPages
  const activePageId = pages[0]?.attributes.id ?? ""

  return [
    { type: "SET_PAGES", payload: pages },
    { type: "SET_ACTIVE_PAGE", payload: activePageId },
    { type: "SET_SELECTED_COMPONENT", payload: "" },
    { type: "SET_SELECTED_COMPONENT_ANCESTORS", payload: "" },
    {
      type: "ADD_TO_HISTORY",
      payload: {
        action: options.historyLabel ?? `Applied template: ${template.metadata.name}`,
        pageState: pages,
      },
    },
  ]
}
