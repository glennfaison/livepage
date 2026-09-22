import { createValidatedAiAction } from "@/features/livepage-ai/adapter"
import { appReducer, initialState } from "@/features/app-state/commands/reducer"

describe("LivePageAI action adapter", () => {
  it("rejects stale component mutations", () => {
    expect(createValidatedAiAction({
      type: "remove_component",
      componentId: "missing",
      reason: "remove it",
    }, initialState)).toBeNull()
  })

  it("does not allow LivePageAI to remove the active page root", () => {
    expect(createValidatedAiAction({
      type: "remove_component",
      componentId: initialState.activePage,
      reason: "Remove the page",
    }, initialState)).toBeNull()
  })

  it("routes a validated action through reducer history", () => {
    const action = createValidatedAiAction({
      type: "add_component",
      tag: "paragraph",
      reason: "add copy",
    }, initialState)
    expect(action).not.toBeNull()
    const result = appReducer(initialState, action!)
    expect(result.componentTree[0].children).toHaveLength(1)
    expect(result.history).toHaveLength(1)
  })

  it("applies custom classes supplied with add_component onto the new component's attributes", () => {
    const action = createValidatedAiAction({
      type: "add_component",
      tag: "paragraph",
      content: "Some copy",
      customClasses: "max-w-2xl text-muted-foreground",
      reason: "add styled copy",
    }, initialState)
    expect(action).not.toBeNull()
    const result = appReducer(initialState, action!)
    const inserted = result.componentTree[0].children[0]
    expect(typeof inserted).not.toBe("string")
    if (typeof inserted !== "string") {
      expect(inserted.attributes["custom-classes"]).toBe("max-w-2xl text-muted-foreground")
    }
  })

  it("does not apply a response after the page changed", () => {
    const action = createValidatedAiAction({
      type: "add_component",
      tag: "paragraph",
      reason: "add copy",
    }, initialState, 2)
    expect(appReducer(initialState, action!)).toEqual(initialState)
  })

  it("applies each concrete multi-step proposal through the client reducer", () => {
    const proposals = [
      { type: "add_component" as const, tag: "header1" as const, parentId: "page-1", content: "Alex Morgan — Software Engineer", reason: "Add the resume introduction." },
      { type: "add_component" as const, tag: "paragraph" as const, parentId: "page-1", content: "Building reliable products with TypeScript and React.", reason: "Add the professional summary." },
      { type: "add_component" as const, tag: "link" as const, parentId: "page-1", content: "View my GitHub", reason: "Add the GitHub link." },
    ]

    let state = initialState
    for (const proposal of proposals) {
      const action = createValidatedAiAction(proposal, state, state.currentHistoryIndex)
      expect(action).not.toBeNull()
      state = appReducer(state, action!)
    }

    expect(state.componentTree[0].children).toHaveLength(3)
    expect(state.componentTree[0].children.map((child) => typeof child === "string" ? child : child.tag)).toEqual(["header1", "paragraph", "link"])
    expect(state.componentTree[0].children.map((child) => typeof child === "string" ? child : child.children[0])).toEqual([
      "Alex Morgan — Software Engineer",
      "Building reliable products with TypeScript and React.",
      "View my GitHub",
    ])
    expect(state.history).toHaveLength(3)
    expect(state.currentHistoryIndex).toBe(2)
  })

  it("accepts settings fields exposed by the target component metadata", () => {
    const state = appReducer(initialState, {
      type: "INSERT_COMPONENT",
      payload: { newComponentTag: "paragraph", parentId: "page-1" },
    })
    const componentId = state.componentTree[0].children[0]
    if (typeof componentId === "string") throw new Error("Expected a paragraph component")

    const action = createValidatedAiAction({
      type: "update_component",
      componentId: componentId.attributes.id,
      field: "custom-classes",
      value: "prose-lg",
      reason: "Improve the paragraph presentation.",
    }, state)

    expect(action).not.toBeNull()
    const result = appReducer(state, action!)
    const updated = result.componentTree[0].children[0]
    if (typeof updated === "string") throw new Error("Expected a paragraph component")
    expect(updated.attributes["custom-classes"]).toBe("prose-lg")
  })

  it("produces the same component ID whether the action is applied once or replayed (client shadow-state simulation)", () => {
    // LivePageAIChat's mutation loop applies each validated action twice: once as a local
    // "simulation" (to compute expectedHistoryIndex/observation before committing) and once
    // via the real dispatch. If component-ID generation happened inside the reducer, those two
    // applications would mint different IDs, and any later step that targets "the" new
    // component by ID would silently fail against the real store. See the diagnose-skill
    // history for the original repro: only the first AI mutation ever persisted.
    const action = createValidatedAiAction({
      type: "add_component",
      tag: "header1",
      parentId: "page-1",
      reason: "Add the welcome section.",
    }, initialState, initialState.currentHistoryIndex)
    expect(action).not.toBeNull()

    const simulated = appReducer(initialState, action!)
    const real = appReducer(initialState, action!)

    const simulatedId = simulated.componentTree[0].children.map((child) => typeof child === "string" ? child : child.attributes.id)
    const realId = real.componentTree[0].children.map((child) => typeof child === "string" ? child : child.attributes.id)
    expect(simulatedId).toEqual(realId)
  })

  it("rejects fields that are not declared by the target component metadata", () => {
    const state = appReducer(initialState, {
      type: "INSERT_COMPONENT",
      payload: { newComponentTag: "paragraph", parentId: "page-1" },
    })
    const component = state.componentTree[0].children[0]
    if (typeof component === "string") throw new Error("Expected a paragraph component")

    expect(createValidatedAiAction({
      type: "update_component",
      componentId: component.attributes.id,
      field: "tone",
      value: "loud",
      reason: "Change an unsupported setting.",
    }, state)).toBeNull()
  })
})
