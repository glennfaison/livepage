"use client"

import type React from "react"

import { useMutation } from "@tanstack/react-query"
import { useReducer, useEffect, useCallback } from "react"
import { appReducer, initialState } from "./reducer"
import type { AppState, AppAction } from "./types"
import type { ComponentAttributes, ComponentTag, DesignComponent } from "@/features/design-components/types"
import { toast } from "@/components/ui/use-toast"
import * as ShortcodeParser from "../shortcode-parser/parser"

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize history when pages are first loaded
  useEffect(() => {
    if (state.componentTree.length > 0 && state.history.length === 0) {
      dispatch({
        type: "ADD_TO_HISTORY",
        payload: {
          action: "Page created",
          pageState: state.componentTree,
        },
      })
      dispatch({ type: "SET_CURRENT_HISTORY_INDEX", payload: 0 })
    }
  }, [state.componentTree, state.history])

  return { state, dispatch }
}

export function usePageOperations() {
  const savePageAsJsonMutation = useMutation({
    mutationFn: async (page: DesignComponent<"page">) => {
      const data = JSON.stringify(page, null)
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

  const savePageAsShortcodeMutation = useMutation({
    mutationFn: async (page: DesignComponent<"page">) => {
      const data = ShortcodeParser.stringify([page])
      const blob = new Blob([data], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${page.attributes.title.toLowerCase().replace(/\s+/g, "-")}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return page
    },
    onSuccess: () => {
      toast({
        title: "Page saved",
        description: "Your page has been saved as a Shortcode file.",
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

  const savePageAsHtmlMutation = useMutation({
    mutationFn: async (page: DesignComponent<"page">) => {
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
        ${renderComponentsToHTML(page.children)}
      </body>
      </html>
      `

      // Create and download the HTML file
      const blob = new Blob([htmlTemplate], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${page.attributes.title.toLowerCase().replace(/\s+/g, "-")}.html`
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

  const loadPageFromJsonMutation = useMutation({
    mutationFn: async (file: File): Promise<DesignComponent<"page">> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            const loadedPage = JSON.parse(content) as DesignComponent<"page">
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

  const loadPageFromShortcodeMutation = useMutation({
    mutationFn: async (file: File): Promise<DesignComponent<"page">> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            const pages = ShortcodeParser.parse(content)
            const loadedPage = pages[0] as unknown as DesignComponent<"page">
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
        description: `${loadedPage.attributes.title} has been loaded successfully.`,
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

  return {
    savePageAsShortcodeMutation,
    savePageAsJsonMutation,
    savePageAsHtmlMutation,
    loadPageMutation: loadPageFromJsonMutation,
    loadPageFromShortcodeMutation,
  }
}

const renderComponentsToHTML = (components: DesignComponent<ComponentTag>[]): string => {
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
      case "inline-text": {
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
    (components: DesignComponent<ComponentTag>[], id: string): DesignComponent<ComponentTag> | null => {
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
  const addComponent = useCallback(({ tag, parentId, index }: { tag: ComponentTag, parentId?: string, index?: number }) => {
    console.log("addComponent")
    dispatch({
      type: "ADD_COMPONENT",
      payload: { newComponentTag: tag, parentId, index },
    })

    // Add to history after state update
    setTimeout(() => {
      dispatch({
        type: "ADD_TO_HISTORY",
        payload: {
          action: `Added ${tag}`,
          pageState: state.componentTree,
        },
      })
    }, 0)

    toast({
      title: "Component added",
      description: `Added a new ${tag} component to the page.`,
    })
  }, [dispatch, state.componentTree])

  // Update component
  const updateComponent = useCallback(
    <Tag extends ComponentTag>(id: string, updates: Partial<DesignComponent<Tag>>) => {
      dispatch({
        type: "UPDATE_COMPONENT",
        payload: { componentId: id, updates, },
      })

      // Add to history after state update
      setTimeout(() => {
        const currentPage = state.componentTree.find((page) => page.id === state.activePage)
        if (currentPage) {
          const component = findComponentById(currentPage.children, id)
          if (component) {
            dispatch({
              type: "ADD_TO_HISTORY",
              payload: {
                action: `Edited ${component.tag}`,
                pageState: state.componentTree,
              },
            })
          }
        }
      }, 0)
    },
    [dispatch, state.activePage, state.componentTree, findComponentById],
  )

  const setSelectedComponent = useCallback((componentId: string): void => {
    if (state.pageBuilderMode === "edit") {
      dispatch({ type: "SET_SELECTED_COMPONENT", payload: componentId })
    }
  }, [dispatch, state.pageBuilderMode])

  // Remove component
  const removeComponent = useCallback((id: string) => {
    dispatch({
      type: "REMOVE_COMPONENT",
      payload: { componentId: id },
    })

    // Add to history after state update
    setTimeout(() => {
      const currentPage = state.componentTree.find((page) => page.id === state.activePage)
      const component = findComponentById(currentPage?.children || [], id)
      if (component) {
        dispatch({
          type: "ADD_TO_HISTORY",
          payload: {
            action: `Deleted ${component.tag}`,
            pageState: state.componentTree,
          },
        })
      }
    }, 0)

    toast({
      title: "Component removed",
      description: "The component has been removed from the page.",
    })
  }, [dispatch, state.componentTree, state.activePage, findComponentById])

  // Duplicate component
  const duplicateComponent = useCallback((id: string) => {
    dispatch({ type: "DUPLICATE_COMPONENT", payload: { componentId: id } })

    // Add to history after state update
    setTimeout(() => {
      const currentPage = state.componentTree.find((page) => page.id === state.activePage)
      const componentToDuplicate = currentPage ? findComponentById(currentPage.children, id) : null

      if (!componentToDuplicate) return
      dispatch({
        type: "ADD_TO_HISTORY",
        payload: {
          action: `Duplicated ${componentToDuplicate.tag}`,
          pageState: state.componentTree,
        },
      })
    }, 0)

    toast({
      title: "Component duplicated",
      description: "The component has been duplicated successfully.",
    })
  }, [dispatch, state.activePage, state.componentTree, findComponentById])

  const replaceComponent = useCallback((oldComponentId: string, newComponentTag: ComponentTag) => {
    dispatch({
      type: "REPLACE_COMPONENT",
      payload: { oldComponentId, newComponentTag },
    })

    // Add to history after state update
    setTimeout(() => {
      dispatch({
        type: "ADD_TO_HISTORY",
        payload: {
          action: `Replaced component ${oldComponentId} with ${newComponentTag}`,
          pageState: state.componentTree,
        },
      })
    }, 0)

    toast({
      title: "Component replaced",
      description: `Replaced component ${oldComponentId} with ${newComponentTag}.`,
    })
  }, [dispatch, state.componentTree])

  return {
    addComponent,
    updateComponent,
    removeComponent,
    duplicateComponent,
    setSelectedComponent,
    replaceComponent,
    findComponentById,
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
