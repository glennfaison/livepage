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
        id: "page-2",
        title: "New Page",
        attributes: {},
        components: [],
      },
    ]

    const action: AppAction = {
      type: "SET_PAGES",
      payload: newPages,
    }

    const result = appReducer(state, action)
    expect(result.pages).toEqual(newPages)
  })

  it("should handle ADD_PAGE", () => {
    const newPage = {
      id: "page-2",
      title: "New Page",
      attributes: {},
      components: [],
    }

    const action: AppAction = {
      type: "ADD_PAGE",
      payload: newPage,
    }

    const result = appReducer(state, action)
    expect(result.pages).toHaveLength(state.pages.length + 1)
    expect(result.pages).toContainEqual(newPage)
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

  it("should handle ADD_COMPONENT to root level", () => {
    const component = createDesignComponent("header1", generateId())

    const action: AppAction = {
      type: "ADD_COMPONENT",
      payload: {
        pageId: "page-1",
        component,
        index: 0,
      },
    }

    const result = appReducer(state, action)
    expect(result.pages[0].components).toHaveLength(1)
    expect(result.pages[0].components[0]).toEqual(component)
    expect(result.selectedComponentId).toBe(component.id)
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

  it("should handle SET_PREVIEW_MODE", () => {
    const action: AppAction = {
      type: "SET_PREVIEW_MODE",
      payload: true,
    }

    const result = appReducer(state, action)
    expect(result.previewMode).toBe(true)
  })
})
