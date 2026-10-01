import { createDesignComponentInstance } from "@/client/features/design-components"
import { appReducer, initialState } from "@/client/features/app-state/commands/reducer"
import type { AppState, AppAction } from "@/client/features/app-state"
import { generateId } from "@/client/lib/utils"

describe("App Reducer", () => {
  let state: AppState

  beforeEach(() => {
    state = { ...initialState }
  })

  it("should return the initial state", () => {
    const result = appReducer(state, {} as AppAction)
    expect(result).toEqual(state)
  })

  it("should handle SET_PAGES", () => {
    const newPages = [
      {
        tag: "page",
        attributes: { id: "page-2", title: "New Page" },
        children: [],
      },
    ] as any

    const action: AppAction = {
      type: "SET_PAGES",
      payload: newPages,
    }

    const result = appReducer(state, action)
    expect(result.componentTree).toEqual(newPages)
  })

  it("should handle ADD_PAGE", () => {
    const newPage = {
      tag: "page",
      attributes: { id: "page-2", title: "New Page" },
      children: [],
    } as any

    const action: AppAction = {
      type: "ADD_PAGE",
      payload: newPage,
    }

    const result = appReducer(state, action)
    expect(result.componentTree).toHaveLength(state.componentTree.length + 1)
    expect(result.componentTree).toContainEqual(newPage)
  })

  it("should handle SET_ACTIVE_PAGE", () => {
    const pageId = "page-2"

    const action: AppAction = {
      type: "SET_ACTIVE_PAGE",
      payload: pageId,
    }

    const result = appReducer(state, action)
    expect(result.activePage).toBe(pageId)
  })

  it("should handle INSERT_COMPONENT to root level", () => {
    const action: AppAction = {
      type: "INSERT_COMPONENT",
      payload: {
        newComponentTag: "header1",
        parentId: "page-1",
        index: 0,
      },
    }

    const result = appReducer(state, action)
    expect(result.componentTree[0].children).toHaveLength(1)
    expect((result.componentTree[0].children[0] as any).tag).toBe("header1")
    expect(result.selectedComponentId).toBe((result.componentTree[0].children[0] as any).attributes.id)
  })

  it("should record history after INSERT_COMPONENT", () => {
    const action: AppAction = {
      type: "INSERT_COMPONENT",
      payload: {
        newComponentTag: "header1",
        parentId: "page-1",
        index: 0,
      },
    }

    const result = appReducer(state, action)
    expect(result.history).toHaveLength(1)
    expect(result.currentHistoryIndex).toBe(0)
    expect((result.history[0].pageState[0].children[0] as { tag: string }).tag).toBe("header1")
  })

  it("should generate unique history ids across rapid updates", () => {
    const dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(1782154286619)
    const randomSpy = jest.spyOn(Math, "random")
      .mockReturnValueOnce(0.1111111111111111)
      .mockReturnValueOnce(0.2222222222222222)
      .mockReturnValueOnce(0.3333333333333333)
      .mockReturnValueOnce(0.4444444444444444)

    try {
      const firstInsert = appReducer(state, {
        type: "INSERT_COMPONENT",
        payload: {
          newComponentTag: "header1",
          parentId: "page-1",
          index: 0,
        },
      })

      const secondResult = appReducer(firstInsert, {
        type: "ADD_TO_HISTORY",
        payload: {
          action: "Manual history entry",
          pageState: firstInsert.componentTree,
        },
      })

      expect(secondResult.history[0].id).not.toBe(secondResult.history[1].id)
    } finally {
      randomSpy.mockRestore()
      dateNowSpy.mockRestore()
    }
  })

  it("should handle SET_SELECTED_COMPONENT", () => {
    const componentId = "test-component-id"

    const action: AppAction = {
      type: "SET_SELECTED_COMPONENT",
      payload: componentId,
    }

    const result = appReducer(state, action)
    expect(result.selectedComponentId).toBe(componentId)
  })

  it("should handle SET_PAGE_BUILDER_MODE", () => {
    const action: AppAction = {
      type: "SET_PAGE_BUILDER_MODE",
      payload: "preview",
    }

    const result = appReducer(state, action)
    expect(result.pageBuilderMode).toBe("preview")
  })

  describe("history truncation after an undo", () => {
    function insertHeader(currentState: AppState, index: number): AppState {
      return appReducer(currentState, {
        type: "INSERT_COMPONENT",
        payload: { newComponentTag: "header1", parentId: "page-1", index },
      })
    }

    it("drops abandoned future entries when a new edit follows an undo (INSERT_COMPONENT)", () => {
      const afterFirstEdit = insertHeader(state, 0)
      const afterSecondEdit = insertHeader(afterFirstEdit, 0)
      expect(afterSecondEdit.history).toHaveLength(2)
      expect(afterSecondEdit.currentHistoryIndex).toBe(1)

      // Simulate "Undo" (as the command palette does): jump back to index 0
      // without going through the reducer's own history-append path.
      const afterUndo: AppState = {
        ...afterSecondEdit,
        componentTree: afterSecondEdit.history[0].pageState,
        currentHistoryIndex: 0,
      }

      // A brand new edit made after the undo should overwrite the abandoned
      // "future" entry (the old index-1 entry) rather than pile up after it.
      const afterThirdEdit = insertHeader(afterUndo, 0)

      expect(afterThirdEdit.history).toHaveLength(2)
      expect(afterThirdEdit.currentHistoryIndex).toBe(1)
      expect(afterThirdEdit.history[1].action).toBe("Inserted header1")
      // The abandoned entry from afterSecondEdit must not still be present.
      expect(afterThirdEdit.history[1].id).not.toBe(afterSecondEdit.history[1].id)
    })

    it("drops abandoned future entries when a new edit follows an undo (ADD_TO_HISTORY)", () => {
      const afterFirstEdit = insertHeader(state, 0)
      const afterSecondEdit = insertHeader(afterFirstEdit, 0)

      const afterUndo: AppState = {
        ...afterSecondEdit,
        componentTree: afterSecondEdit.history[0].pageState,
        currentHistoryIndex: 0,
      }

      const afterManualEntry = appReducer(afterUndo, {
        type: "ADD_TO_HISTORY",
        payload: { action: "Applied template: Test", pageState: afterUndo.componentTree },
      })

      expect(afterManualEntry.history).toHaveLength(2)
      expect(afterManualEntry.currentHistoryIndex).toBe(1)
      expect(afterManualEntry.history[1].action).toBe("Applied template: Test")
    })

    it("still appends normally when there is no earlier undo", () => {
      const afterFirstEdit = insertHeader(state, 0)
      const afterSecondEdit = insertHeader(afterFirstEdit, 0)

      expect(afterSecondEdit.history).toHaveLength(2)
      expect(afterSecondEdit.currentHistoryIndex).toBe(1)
      expect(afterSecondEdit.history[0].id).toBe(afterFirstEdit.history[0].id)
    })
  })
})

describe("insertComponent", () => {
  it("should insert a component at the root level if no parentId is provided", () => {
    const { insertComponent } = require("@/client/features/app-state/commands/helpers")
    const state = { ...initialState, componentTree: [] }
    const component = createDesignComponentInstance("header1", generateId())
    const newComponents = insertComponent({ components: state.componentTree, newComponent: component })
    state.componentTree = newComponents
    expect(state.componentTree).toHaveLength(1)
    expect(state.componentTree[0]).toEqual(component)
  })

  it("should insert a component as a child of a parent component", () => {
    const { insertComponent } = require("@/client/features/app-state/commands/helpers")
    const parent = createDesignComponentInstance("row", generateId())
    const state = { ...initialState, componentTree: [parent] }
    const child = createDesignComponentInstance("header1", generateId())
    const newComponents = insertComponent({ components: state.componentTree, newComponent: child, parentId: parent.attributes.id })
    state.componentTree = newComponents
    expect(state.componentTree[0].children).toHaveLength(1)
    expect(state.componentTree[0].children[0]).toEqual(child)
  })
})
