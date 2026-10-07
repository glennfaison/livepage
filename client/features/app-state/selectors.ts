import type { AppNode, AppState } from "@/client/features/types"

function findPageById(componentTree: ReadonlyArray<AppNode>, pageId: string): AppNode | undefined {
  return componentTree.find((page) => page.attributes.id === pageId)
}

/**
 * Returns the currently active page from the component tree, falling back to
 * the first page when the active page ID is not found.
 */
export function selectCurrentPage(state: Pick<AppState, "componentTree" | "activePage">): AppNode | undefined {
  return findPageById(state.componentTree, state.activePage) ?? state.componentTree[0]
}
