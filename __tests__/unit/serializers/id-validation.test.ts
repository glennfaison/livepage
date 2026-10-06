import { validateAndFixDuplicateIds, hasDuplicateIds } from "@/client/features/serializers/id-validation"
import type { AppNode } from "@/client/features/types"

function createNode(tag: string, id: string, children: ReadonlyArray<AppNode | string> = []): AppNode {
  return {
    tag,
    attributes: { id },
    children,
  }
}

describe("id-validation", () => {
  describe("hasDuplicateIds", () => {
    it("returns false for unique IDs", () => {
      const tree: ReadonlyArray<AppNode> = [
        createNode("page", "page-1", [
          createNode("row", "row-1"),
          createNode("row", "row-2"),
        ]),
      ]
      expect(hasDuplicateIds(tree)).toBe(false)
    })

    it("returns true for duplicate IDs at root level", () => {
      const tree: ReadonlyArray<AppNode> = [
        createNode("page", "page-1"),
        createNode("page", "page-1"),
      ]
      expect(hasDuplicateIds(tree)).toBe(true)
    })

    it("returns true for duplicate IDs in nested children", () => {
      const tree: ReadonlyArray<AppNode> = [
        createNode("page", "page-1", [
          createNode("row", "row-1"),
          createNode("row", "row-1"),
        ]),
      ]
      expect(hasDuplicateIds(tree)).toBe(true)
    })

    it("returns true for duplicate IDs across different levels", () => {
      const tree: ReadonlyArray<AppNode> = [
        createNode("page", "page-1", [
          createNode("row", "page-1"),
        ]),
      ]
      expect(hasDuplicateIds(tree)).toBe(true)
    })

    it("handles empty tree", () => {
      expect(hasDuplicateIds([])).toBe(false)
    })

    it("handles nodes without IDs", () => {
      const tree: ReadonlyArray<AppNode> = [
        createNode("page", "page-1", [
          { tag: "text", attributes: {}, children: [] },
        ]),
      ]
      expect(hasDuplicateIds(tree)).toBe(false)
    })
  })

  describe("validateAndFixDuplicateIds", () => {
    it("returns original tree with zero duplicates when IDs are unique", () => {
      const tree: ReadonlyArray<AppNode> = [
        createNode("page", "page-1", [
          createNode("row", "row-1"),
          createNode("column", "col-1"),
        ]),
      ]
      const result = validateAndFixDuplicateIds(tree)
      expect(result.duplicateCount).toBe(0)
      expect(result.fixedIds).toEqual([])
      expect(result.componentTree).toBe(tree)
    })

    it("fixes duplicate IDs at root level", () => {
      const tree: ReadonlyArray<AppNode> = [
        createNode("page", "page-1"),
        createNode("page", "page-1"),
      ]
      const result = validateAndFixDuplicateIds(tree)
      expect(result.duplicateCount).toBe(1)
      expect(result.fixedIds).toHaveLength(1)
      expect(result.fixedIds[0].oldId).toBe("page-1")
      expect(result.fixedIds[0].newId).not.toBe("page-1")

      const ids = result.componentTree.map((n) => n.attributes.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it("fixes duplicate IDs in nested children", () => {
      const tree: ReadonlyArray<AppNode> = [
        createNode("page", "page-1", [
          createNode("row", "row-1"),
          createNode("row", "row-1"),
        ]),
      ]
      const result = validateAndFixDuplicateIds(tree)
      expect(result.duplicateCount).toBe(1)
      expect(result.fixedIds).toHaveLength(1)

      const allIds: string[] = []
      const collect = (nodes: ReadonlyArray<AppNode | string>) => {
        for (const node of nodes) {
          if (typeof node === "string") continue
          allIds.push(node.attributes.id)
          collect(node.children)
        }
      }
      collect(result.componentTree)
      expect(new Set(allIds).size).toBe(allIds.length)
    })

    it("fixes multiple duplicate IDs", () => {
      const tree: ReadonlyArray<AppNode> = [
        createNode("page", "page-1"),
        createNode("page", "page-1"),
        createNode("page", "page-1"),
      ]
      const result = validateAndFixDuplicateIds(tree)
      expect(result.duplicateCount).toBe(2)
      expect(result.fixedIds).toHaveLength(2)

      const ids = result.componentTree.map((n) => n.attributes.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it("preserves the first occurrence of each ID", () => {
      const originalId = "duplicate-id"
      const tree: ReadonlyArray<AppNode> = [
        createNode("page", originalId),
        createNode("page", originalId),
      ]
      const result = validateAndFixDuplicateIds(tree)
      expect(result.componentTree[0].attributes.id).toBe(originalId)
      expect(result.componentTree[1].attributes.id).not.toBe(originalId)
    })

    it("handles deeply nested duplicates", () => {
      const tree: ReadonlyArray<AppNode> = [
        createNode("page", "page-1", [
          createNode("row", "row-1", [
            createNode("column", "col-1", [
              createNode("text", "duplicate-id"),
            ]),
          ]),
          createNode("row", "row-2", [
            createNode("column", "col-2", [
              createNode("text", "duplicate-id"),
            ]),
          ]),
        ]),
      ]
      const result = validateAndFixDuplicateIds(tree)
      expect(result.duplicateCount).toBe(1)

      const allIds: string[] = []
      const collect = (nodes: ReadonlyArray<AppNode | string>) => {
        for (const node of nodes) {
          if (typeof node === "string") continue
          allIds.push(node.attributes.id)
          collect(node.children)
        }
      }
      collect(result.componentTree)
      expect(new Set(allIds).size).toBe(allIds.length)
    })

    it("handles string children (text nodes)", () => {
      const tree: ReadonlyArray<AppNode> = [
        createNode("page", "page-1", [
          createNode("text", "text-1", ["some text content"]),
          createNode("text", "text-1", ["more text"]),
        ]),
      ]
      const result = validateAndFixDuplicateIds(tree)
      expect(result.duplicateCount).toBe(1)
      expect(result.fixedIds).toHaveLength(1)
    })
  })
})