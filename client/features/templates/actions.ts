import type { AppAction, AppNode } from "@/client/features/types"
import { appNodeTreeSchema } from "@/client/features/serializers/schema"
import type { PageTemplateDefinition } from "@/client/features/templates/schema"

/**
 * Deep clones the pages from a template definition, ensuring a fresh copy
 * that can be modified without affecting the original template.
 *
 * @param template - The template definition to clone pages from
 * @returns Deep-cloned array of page components
 */
export function cloneTemplatePages(template: PageTemplateDefinition): ReadonlyArray<AppNode> {
  return appNodeTreeSchema.parse(JSON.parse(JSON.stringify(template.content.pages)))
}

/**
 * Creates a sequence of app actions to apply a template, optionally customizing
 * the pages before applying. The actions include setting pages, activating the
 * first page, clearing selection, and adding a history entry.
 *
 * @param template - The template definition to apply
 * @param options.customizePages - Optional function to customize cloned pages before applying
 * @param options.historyLabel - Optional custom label for the history entry
 * @returns Array of app actions to dispatch
 */
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
