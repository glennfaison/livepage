/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDesignComponentInstance } from "@/client/features/design-components"
import { appReducer, initialState } from "@/client/features/app-state"
import type { AppState, AppAction, PersistedSession } from "@/client/features/app-state"
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

  describe("HYDRATE_FROM_STORAGE", () => {
    const restoredSession: PersistedSession = {
      componentTree: [{ tag: "page", attributes: { id: "page-9", title: "Restored" }, children: [] }],
      promptAssistEnabled: true,
    }

    it("adopts the stored component tree and prompt assist flag", () => {
      const result = appReducer(state, { type: "HYDRATE_FROM_STORAGE", payload: restoredSession })

      expect(result.componentTree).toEqual(restoredSession.componentTree)
      expect(result.promptAssistEnabled).toBe(true)
      expect(result.stale).toBe(false)
    })

    it("seeds the initial history entry from the adopted tree", () => {
      const result = appReducer(state, { type: "HYDRATE_FROM_STORAGE", payload: restoredSession })

      expect(result.history).toHaveLength(1)
      expect(result.history[0].action).toBe("Page created")
      expect(result.history[0].pageState).toEqual(restoredSession.componentTree)
      expect(result.currentHistoryIndex).toBe(0)
    })

    it("keeps the current value for fields that were never stored", () => {
      const result = appReducer(state, {
        type: "HYDRATE_FROM_STORAGE",
        payload: { componentTree: null, promptAssistEnabled: null },
      })

      expect(result.componentTree).toEqual(state.componentTree)
      expect(result.promptAssistEnabled).toBe(state.promptAssistEnabled)
      expect(result.stale).toBe(state.stale)
      expect(result.history).toHaveLength(1)
      expect(result.history[0].action).toBe("Page created")
    })

    it("does not re-seed history when a session already has entries", () => {
      const withHistory = appReducer(state, {
        type: "INSERT_COMPONENT",
        payload: { newComponentTag: "header1", parentId: "page-1", index: 0 },
      })

      const result = appReducer(withHistory, { type: "HYDRATE_FROM_STORAGE", payload: restoredSession })

      expect(result.history).toEqual(withHistory.history)
      expect(result.currentHistoryIndex).toBe(withHistory.currentHistoryIndex)
      expect(result.componentTree).toEqual(restoredSession.componentTree)
    })
  })
})

describe("insertComponent", () => {
  it("should insert a component at the root level if no parentId is provided", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { insertComponent } = require("@/client/features/app-state/commands/helpers")
    const state = { ...initialState, componentTree: [] }
    const component = createDesignComponentInstance("header1", generateId())
    const newComponents = insertComponent({ components: state.componentTree, newComponent: component })
    state.componentTree = newComponents
    expect(state.componentTree).toHaveLength(1)
    expect(state.componentTree[0]).toEqual(component)
  })

  it("should insert a component as a child of a parent component", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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

describe("App Reducer stale gating", () => {
  it("rejects document-changing actions while stale", () => {
    const staleState: AppState = { ...initialState, stale: true }

    const edited = appReducer(staleState, {
      type: "INSERT_COMPONENT",
      payload: { newComponentTag: "header1", parentId: "page-1", index: 0 },
    })

    expect(edited).toBe(staleState)
    expect(edited.componentTree).toEqual(staleState.componentTree)
    expect(edited.stale).toBe(true)
  })

  it("allows UI-only actions while stale", () => {
    const staleState: AppState = { ...initialState, stale: true }

    const edited = appReducer(staleState, { type: "SET_TOOLBAR_MINIMIZED", payload: true })

    expect(edited.toolbarMinimized).toBe(true)
    expect(edited.stale).toBe(true)
  })

  it("allows clearing stale so recovery can proceed", () => {
    const staleState: AppState = { ...initialState, stale: true }

    const cleared = appReducer(staleState, { type: "SET_STALE", payload: false })

    expect(cleared.stale).toBe(false)
  })
})
