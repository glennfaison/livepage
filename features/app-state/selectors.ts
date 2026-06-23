import type { AppNode, AppState } from "@/features/types"

export function findPageById(componentTree: ReadonlyArray<AppNode>, pageId: string): AppNode | undefined {
  return componentTree.find((page) => page.attributes.id === pageId)
}

export function selectCurrentPage(state: Pick<AppState, "componentTree" | "activePage">): AppNode | undefined {
  return findPageById(state.componentTree, state.activePage) ?? state.componentTree[0]
}

export function selectPageTitle(page: AppNode | undefined): string {
  return page?.attributes.title ?? "page"
}
