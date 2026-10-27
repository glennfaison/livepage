import { moveComponent } from "@/client/features/app-state/commands/helpers"
import type { AppNode } from "@/client/features/types"

const node = (id: string, children: Array<AppNode | string> = []): AppNode =>
  ({ tag: "row", attributes: { id }, children }) as unknown as AppNode

const ids = (children: ReadonlyArray<AppNode | string>) =>
  children.map((child) => (typeof child === "string" ? child : child.attributes.id))

const rowOf = (...childIds: string[]) => node("row", childIds.map((id) => node(id)))

/** Moves `componentId` to insertion index `index` of `row` and returns the row's child ids. */
const moveWithinRow = (childIds: string[], componentId: string, index: number) => {
  const result = moveComponent({ components: [rowOf(...childIds)], componentId, newParentId: "row", index })
  return ids(result[0].children)
}

describe("moveComponent within the same parent", () => {
  // `index` is an insertion index: the position among the children as they are before the move,
  // which is what a divider between two children stands for. Divider k sits before child k.

  it("moves a component forward onto a later divider", () => {
    // [A, B, C]: the divider after B is index 2, after C is index 3.
    expect(moveWithinRow(["A", "B", "C"], "A", 2)).toEqual(["B", "A", "C"])
    expect(moveWithinRow(["A", "B", "C"], "A", 3)).toEqual(["B", "C", "A"])
    expect(moveWithinRow(["A", "B", "C"], "B", 3)).toEqual(["A", "C", "B"])
  })

  it("moves a component backward onto an earlier divider", () => {
    expect(moveWithinRow(["A", "B", "C"], "C", 0)).toEqual(["C", "A", "B"])
    expect(moveWithinRow(["A", "B", "C"], "C", 1)).toEqual(["A", "C", "B"])
    expect(moveWithinRow(["A", "B", "C"], "B", 0)).toEqual(["B", "A", "C"])
  })

  it("leaves the order alone when dropped on either divider next to itself", () => {
    expect(moveWithinRow(["A", "B", "C"], "B", 1)).toEqual(["A", "B", "C"])
    expect(moveWithinRow(["A", "B", "C"], "B", 2)).toEqual(["A", "B", "C"])
    expect(moveWithinRow(["A", "B", "C"], "A", 0)).toEqual(["A", "B", "C"])
    expect(moveWithinRow(["A", "B", "C"], "C", 3)).toEqual(["A", "B", "C"])
  })

  it("appends when no index is given", () => {
    const result = moveComponent({ components: [rowOf("A", "B", "C")], componentId: "A", newParentId: "row" })
    expect(ids(result[0].children)).toEqual(["B", "C", "A"])
  })

  it("counts text children as positions, like the divider indices do", () => {
    const row = node("row", [node("A"), "text", node("B")])
    const result = moveComponent({ components: [row], componentId: "A", newParentId: "row", index: 3 })
    expect(ids(result[0].children)).toEqual(["text", "B", "A"])
  })
})

describe("moveComponent between parents", () => {
  it("inserts at the insertion index without adjusting it", () => {
    const tree = [node("page", [rowOf("A", "B", "C"), node("other", [node("X")])])]
    const result = moveComponent({ components: tree, componentId: "X", newParentId: "row", index: 1 })
    const row = (result[0].children[0] as AppNode)
    expect(ids(row.children)).toEqual(["A", "X", "B", "C"])
    expect(ids((result[0].children[1] as AppNode).children)).toEqual([])
  })

  it("does not adjust the index when the component came from a different parent at a lower index", () => {
    const tree = [node("page", [node("other", [node("X"), node("Y")]), rowOf("A", "B")])]
    const result = moveComponent({ components: tree, componentId: "X", newParentId: "row", index: 1 })
    expect(ids((result[0].children[1] as AppNode).children)).toEqual(["A", "X", "B"])
  })
})

describe("moveComponent refuses moves that would lose the component", () => {
  it("does nothing when the target parent is the component itself", () => {
    const tree = [node("page", [node("A", [node("child")])])]
    expect(moveComponent({ components: tree, componentId: "A", newParentId: "A", index: 0 })).toEqual(tree)
  })

  it("does nothing when the target parent is one of the component's own descendants", () => {
    const tree = [node("page", [node("A", [node("inner", [node("deep")])])])]
    expect(moveComponent({ components: tree, componentId: "A", newParentId: "deep", index: 0 })).toEqual(tree)
  })

  it("does nothing when the target parent does not exist", () => {
    const tree = [node("page", [node("A"), node("B")])]
    expect(moveComponent({ components: tree, componentId: "A", newParentId: "missing", index: 0 })).toEqual(tree)
  })

  it("does nothing when the component does not exist", () => {
    const tree = [node("page", [node("A")])]
    expect(moveComponent({ components: tree, componentId: "nope", newParentId: "page", index: 0 })).toEqual(tree)
  })
})
