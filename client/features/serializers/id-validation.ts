import type { AppNode } from "@/client/features/types"
import { generateId } from "@/client/lib/utils"

export interface IdValidationResult {
  componentTree: ReadonlyArray<AppNode>
  duplicateCount: number
  fixedIds: ReadonlyArray<{ oldId: string; newId: string }>
}

function collectAllNodes(nodes: ReadonlyArray<AppNode | string>): AppNode[] {
  const result: AppNode[] = []
  for (const node of nodes) {
    if (typeof node === "string") continue
    result.push(node)
    result.push(...collectAllNodes(node.children))
  }
  return result
}

export function validateAndFixDuplicateIds(
  componentTree: ReadonlyArray<AppNode>
): IdValidationResult {
  const allNodes = collectAllNodes(componentTree)
  const idMap = new Map<string, AppNode[]>()
  const fixedIds: Array<{ oldId: string; newId: string }> = []

  for (const node of allNodes) {
    const id = node.attributes.id
    if (!id) continue
    const existing = idMap.get(id) || []
    existing.push(node)
    idMap.set(id, existing)
  }

  const duplicateEntries = Array.from(idMap.entries()).filter(([, nodes]) => nodes.length > 1)
  let duplicateCount = 0

  for (const [, nodes] of duplicateEntries) {
    for (let i = 1; i < nodes.length; i++) {
      const oldId = nodes[i].attributes.id
      const newId = generateId()
      const newAttributes = { ...nodes[i].attributes, id: newId }
      const newNode: AppNode = {
        ...nodes[i],
        attributes: newAttributes,
      }
      Object.assign(nodes[i], newNode)
      fixedIds.push({ oldId, newId })
      duplicateCount++
    }
  }

  return {
    componentTree,
    duplicateCount,
    fixedIds,
  }
}

export function hasDuplicateIds(componentTree: ReadonlyArray<AppNode>): boolean {
  const allNodes = collectAllNodes(componentTree)
  const seenIds = new Set<string>()
  for (const node of allNodes) {
    const id = node.attributes.id
    if (!id) continue
    if (seenIds.has(id)) return true
    seenIds.add(id)
  }
  return false
}