"use client"

import type React from "react"

import { useMutation } from "@tanstack/react-query"
import { useReducer, useEffect, useCallback } from "react"
import { appReducer, initialState } from "./reducer"
import type { AppState, AppAction } from "./types"
import type { ComponentAttributes, ComponentType, DesignComponent, Page } from "@/components/design-components/types"
import { createDesignComponent } from "@/components/page-builder/page-builder"
import { generateId } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize history when pages are first loaded
  useEffect(() => {
    if (state.pages.length > 0 && state.history.length === 0) {
      dispatch({
        type: "ADD_TO_HISTORY",
        payload: {
          action: "Page created",
          pageState: state.pages,
        },
      })
      dispatch({ type: "SET_CURRENT_HISTORY_INDEX", payload: 0 })
    }
  }, [state.pages, state.history])

  return { state, dispatch }
}

export function usePageOperations() {
  // Save page mutation
  const savePageMutation = useMutation({
    mutationFn: async (page: Page) => {
      const data = JSON.stringify(page, null, 2)
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${page.title.toLowerCase().replace(/\s+/g, "-")}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return page
    },
    onSuccess: () => {
      toast({
        title: "Page saved",
        description: "Your page has been saved as a JSON file.",
      })
    },
    onError: () => {
      toast({
        title: "Error saving page",
        description: "Failed to save the page.",
        variant: "destructive",
      })
    },
  })

  // Load page mutation
  const loadPageMutation = useMutation({
    mutationFn: async (file: File): Promise<Page> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            const loadedPage = JSON.parse(content) as Page
            resolve(loadedPage)
          } catch (error) {
            reject(new Error(`Invalid file format ${error}`))
          }
        }
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsText(file)
      })
    },
    onSuccess: (loadedPage) => {
      toast({
        title: "Page loaded",
        description: `${loadedPage.title} has been loaded successfully.`,
      })
    },
    onError: () => {
      toast({
        title: "Error loading page",
        description: "The file format is invalid.",
        variant: "destructive",
      })
    },
  })

  // Export page mutation
  const exportPageMutation = useMutation({
    mutationFn: async (page: Page) => {
      // Basic HTML template
      const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${page.title}</title>
        <style>
          /* Reset and base styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            color: #333;
          }
          .container {
            padding: 1rem;
            max-width: 1200px;
            margin: 0 auto;
          }
          .row {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1rem;
          }
          .column {
            display: flex;
            flex-direction: row;
            gap: 1rem;
            margin-bottom: 1rem;
          }
          .column > * {
            flex: 1;
          }
          
          img {
            max-width: 100%;
            height: auto;
          }
          
          button {
            background-color: #0070f3;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-weight: 500;
          }
          
          button:hover {
            background-color: #0060df;
          }
          
          h1, h2, h3, h4, h5, h6 {
            margin-bottom: 0.5rem;
          }
          
          p {
            margin-bottom: 1rem;
          }
          
          @media (max-width: 768px) {
            .column {
              flex-direction: column;
            }
          }
        </style>
      </head>
      <body>
        ${renderComponentsToHTML(page.components)}
      </body>
      </html>
      `

      // Create and download the HTML file
      const blob = new Blob([htmlTemplate], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${page.title.toLowerCase().replace(/\s+/g, "-")}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return page
    },
    onSuccess: () => {
      toast({
        title: "Page exported",
        description: "Your page has been exported as an HTML file.",
      })
    },
    onError: () => {
      toast({
        title: "Error exporting page",
        description: "Failed to export the page.",
        variant: "destructive",
      })
    },
  })

  return {
    savePageMutation,
    loadPageMutation,
    exportPageMutation,
  }
}

const renderComponentsToHTML = (components: DesignComponent<ComponentType>[]): string => {
  return components.map((component) => {
    const attributes = component.attributes
    switch (component.tag) {
      case "header1": {
        type CastType = ComponentAttributes<typeof component.tag>
        return `<h1>${(attributes as CastType).content}</h1>`
      }
      case "header2": {
        type CastType = ComponentAttributes<typeof component.tag>
        return `<h2>${(attributes as CastType).content}</h2>`
      }
      case "header3": {
        type CastType = ComponentAttributes<typeof component.tag>
        return `<h3>${(attributes as CastType).content}</h3>`
      }
      case "paragraph": {
        type CastType = ComponentAttributes<typeof component.tag>
        return `<p>${(attributes as CastType).content}</p>`
      }
      case "span": {
        type CastType = ComponentAttributes<typeof component.tag>
        return `<span>${(attributes as CastType).content}</span>`
      }
      case "image": {
        type CastType = ComponentAttributes<typeof component.tag>
        return `<img src="${(attributes as CastType).src}" alt="${(attributes as CastType).alt || ""}" />`
      }
      case "button": {
        type CastType = ComponentAttributes<typeof component.tag>
        return `<button>${(attributes as CastType).content}</button>`
      }
      case "row":
        return `<div class="row">${component.children ? renderComponentsToHTML(component.children) : ""}</div>`
      case "column":
        return `<div class="column">${component.children ? renderComponentsToHTML(component.children) : ""}</div>`
      default:
        const _: never = component.tag
        console.log("Unexpected tag:", _)
        return ""
    }
  })
    .join("\n")
}

export function useComponentOperations(dispatch: React.Dispatch<AppAction>, state: AppState) {
  // Find a component by ID (including nested components)
  const findComponentById = useCallback(
    (components: DesignComponent<ComponentType>[], id: string): DesignComponent<ComponentType> | null => {
      for (const component of components) {
        if (component.id === id) {
          return component
        }

        if (component.children) {
          const found = findComponentById(component.children, id)
          if (found) return found
        }
      }

      return null
    },
    [],
  )

  // Add component
  const addComponent = useCallback(
    ({ type, parentId, index = 0 }: { type: ComponentType, parentId?: string, index?: number }) => {
      const newComponent = createDesignComponent(type, generateId())

      dispatch({
        type: "ADD_COMPONENT",
        payload: {
          pageId: state.activePage,
          component: newComponent,
          parentId,
          index,
        },
      })

      // Add to history after state update
      setTimeout(() => {
        dispatch({
          type: "ADD_TO_HISTORY",
          payload: {
            action: `Added ${type}`,
            pageState: state.pages,
          },
        })
      }, 0)

      toast({
        title: "Component added",
        description: `Added a new ${type} component to the page.`,
      })
    },
    [dispatch, state.activePage, state.pages],
  )

  // Update component
  const updateComponent = useCallback(
    <Tag extends ComponentType>(id: string, updates: Partial<ComponentAttributes<Tag>>) => {
      dispatch({
        type: "UPDATE_COMPONENT",
        payload: {
          pageId: state.activePage,
          componentId: id,
          updates,
        },
      })

      // Add to history after state update
      setTimeout(() => {
        const currentPage = state.pages.find((page) => page.id === state.activePage)
        if (currentPage) {
          const component = findComponentById(currentPage.components, id)
          if (component) {
            dispatch({
              type: "ADD_TO_HISTORY",
              payload: {
                action: `Edited ${component.tag}`,
                pageState: state.pages,
              },
            })
          }
        }
      }, 0)
    },
    [dispatch, state.activePage, state.pages, findComponentById],
  )

  // Remove component
  const removeComponent = useCallback(
    (id: string) => {
      const currentPage = state.pages.find((page) => page.id === state.activePage)
      const component = currentPage ? findComponentById(currentPage.components, id) : null

      dispatch({
        type: "REMOVE_COMPONENT",
        payload: {
          pageId: state.activePage,
          componentId: id,
        },
      })

      // Add to history after state update
      setTimeout(() => {
        if (component) {
          dispatch({
            type: "ADD_TO_HISTORY",
            payload: {
              action: `Deleted ${component.tag}`,
              pageState: state.pages,
            },
          })
        }
      }, 0)

      toast({
        title: "Component removed",
        description: "The component has been removed from the page.",
      })
    },
    [dispatch, state.activePage, state.pages, findComponentById],
  )

  // Duplicate component
  const duplicateComponent = useCallback(
    (id: string) => {
      const currentPage = state.pages.find((page) => page.id === state.activePage)
      const componentToDuplicate = currentPage ? findComponentById(currentPage.components, id) : null

      if (!componentToDuplicate) return

      // Deep clone the component with new IDs
      const cloneComponent = <Tag extends ComponentType>(comp: DesignComponent<Tag>): DesignComponent<Tag> => {
        const cloned: DesignComponent<Tag> = {
          ...comp,
          id: generateId(),
          children: comp.children ? comp.children.map(cloneComponent) : [],
        }
        return cloned
      }

      const duplicatedComponent = cloneComponent(componentToDuplicate)

      dispatch({
        type: "DUPLICATE_COMPONENT",
        payload: {
          pageId: state.activePage,
          componentId: id,
          duplicatedComponent,
        },
      })

      // Add to history after state update
      setTimeout(() => {
        dispatch({
          type: "ADD_TO_HISTORY",
          payload: {
            action: `Duplicated ${componentToDuplicate.tag}`,
            pageState: state.pages,
          },
        })
      }, 0)

      toast({
        title: "Component duplicated",
        description: "The component has been duplicated successfully.",
      })
    },
    [dispatch, state.activePage, state.pages, findComponentById],
  )

  const replaceComponent = useCallback(
    (oldComponentId: string, newComponentTag: ComponentType) => {
      const newComponent = createDesignComponent(newComponentTag, generateId())

      dispatch({
        type: "REPLACE_COMPONENT",
        payload: {
          pageId: state.activePage,
          oldComponentId,
          newComponent: newComponent,
        },
      })

      // Add to history after state update
      setTimeout(() => {
        dispatch({
          type: "ADD_TO_HISTORY",
          payload: {
            action: `Replaced component ${oldComponentId} with ${newComponentTag}`,
            pageState: state.pages,
          },
        })
      }, 0)

      toast({
        title: "Component replaced",
        description: `Replaced component ${oldComponentId} with ${newComponentTag}.`,
      })
    },
    [dispatch, state.activePage, state.pages]
  )

  return {
    addComponent,
    updateComponent,
    removeComponent,
    duplicateComponent,
    findComponentById,
    replaceComponent,
  }
}

export function useHistoryOperations(dispatch: React.Dispatch<AppAction>, state: AppState) {
  // Handle history selection
  const handleSelectHistory = useCallback(
    (index: number) => {
      dispatch({
        type: "RESTORE_FROM_HISTORY",
        payload: { historyIndex: index },
      })
    },
    [dispatch],
  )

  // Handle history accept
  const handleHistoryAccept = useCallback(() => {
    if (state.historyPreviewIndex !== null) {
      dispatch({ type: "SET_CURRENT_HISTORY_INDEX", payload: state.historyPreviewIndex })
      dispatch({ type: "SET_ORIGINAL_HISTORY_STATE", payload: null })
      dispatch({ type: "SET_HISTORY_PREVIEW_INDEX", payload: null })
      toast({
        title: "History applied",
        description: "Page has been restored to the selected state.",
      })
    }
  }, [dispatch, state.historyPreviewIndex])

  // Handle history discard
  const handleHistoryDiscard = useCallback(() => {
    if (state.originalHistoryState) {
      dispatch({ type: "SET_PAGES", payload: JSON.parse(JSON.stringify(state.originalHistoryState)) })
      dispatch({ type: "SET_ORIGINAL_HISTORY_STATE", payload: null })
      dispatch({ type: "SET_HISTORY_PREVIEW_INDEX", payload: null })
    }
  }, [dispatch, state.originalHistoryState])

  // Discard all changes
  const handleDiscard = useCallback(() => {
    dispatch({ type: "DISCARD_CHANGES" })
    if (state.history.length > 1) {
      toast({
        title: "Changes discarded",
        description: "Your page has been reset to its initial state.",
      })
    } else {
      toast({
        title: "Nothing to discard",
        description: "No changes have been made yet.",
      })
    }
  }, [dispatch, state.history.length])

  return {
    handleSelectHistory,
    handleHistoryAccept,
    handleHistoryDiscard,
    handleDiscard,
  }
}
