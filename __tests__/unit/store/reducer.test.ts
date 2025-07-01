import { createDesignComponent } from "@/features/design-components"
import { appReducer, initialState } from "@/lib/store/reducer"
import type { AppState, AppAction } from "@/lib/store/types"
import { generateId } from "@/lib/utils"

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
        title: "New Page",
        attributes: { id: "page-2", },
        components: [],
      },
    ]

    const action: AppAction = {
      type: "SET_PAGES",
      payload: newPages,
    }

    const result = appReducer(state, action)
    expect(result.componentTree).toEqual(newPages)
  })

  it("should handle ADD_PAGE", () => {
    const newPage = {
      title: "New Page",
      attributes: { id: "page-2", },
      components: [],
    }

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
    const component = createDesignComponent("header1", generateId())

    const action: AppAction = {
      type: "INSERT_COMPONENT",
      payload: {
        pageId: "page-1",
        component,
        index: 0,
      },
    }

    const result = appReducer(state, action)
    expect(result.componentTree[0].children).toHaveLength(1)
    expect(result.componentTree[0].children[0]).toEqual(component)
    expect(result.selectedComponentId).toBe(component.attributes.id)
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
})

describe("insertComponent", () => {
  it("should insert a component at the root level if no parentId is provided", () => {
    const { insertComponent } = require("@/lib/store/reducer")
    const state = { ...initialState, componentTree: [] }
    const component = createDesignComponent("header1", generateId())
    insertComponent(state, component)
    expect(state.componentTree).toHaveLength(1)
    expect(state.componentTree[0]).toEqual(component)
  })

  it("should insert a component as a child of a parent component", () => {
    const { insertComponent } = require("@/lib/store/reducer")
    const parent = createDesignComponent("row", generateId())
    const state = { ...initialState, componentTree: [parent] }
    const child = createDesignComponent("header1", generateId())
    insertComponent(state, child, parent.attributes.id)
    expect(state.componentTree[0].children).toHaveLength(1)
    expect(state.componentTree[0].children[0]).toEqual(child)
  })
})