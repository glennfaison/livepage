"use client"

import type React from "react"

import { useMutation } from "@tanstack/react-query"
import { useCallback } from "react"
import type { AppState, AppAction, AppNode } from "@/client/features/app-state"
import { selectCurrentPage } from "@/client/features/app-state"
import { createDesignComponentInstance } from "@/client/features/design-components"
import { generateId } from "@/client/lib/utils"
import { toast } from "@/client/components/ui/use-toast"
import {
  deserializeAppStateFromJson,
  deserializeAppStateFromShortcode,
  serializeAppStateAsHtml,
  serializeAppStateAsJson,
  serializeAppStateAsShortcode,
} from "@/client/features/serializers"

export function validateImportedFile(file: File, uploadType: "json" | "shortcode") {
  const expectedExtension = uploadType === "json" ? ".json" : ".txt"
  const label = uploadType === "json" ? "JSON" : "shortcode"

  if (!file) {
    throw new Error("Please choose a file to import.")
  }

  if (file.size === 0) {
    throw new Error("The selected file is empty. Please choose a valid LivePage export.")
  }

  if (!file.name.toLowerCase().endsWith(expectedExtension)) {
    throw new Error(`Please choose a valid ${label} file (${expectedExtension}).`)
  }

  const trimmed = file.name.trim()
  if (!trimmed) {
    throw new Error("The selected file does not have a valid name.")
  }
}

async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content !== "string") {
        reject(new Error("Failed to read the selected file."))
        return
      }
      resolve(content)
    }
    reader.onerror = () => reject(new Error("Failed to read the selected file."))
    reader.readAsText(file)
  })
}

export function usePageOperations(state: AppState) {
  const savePageAsJsonMutation = useMutation({
    mutationFn: async (componentTree: ReadonlyArray<AppNode>) => {
      const page = selectCurrentPage({
        componentTree,
        activePage: state.activePage,
      }) as AppNode | undefined
      const data = serializeAppStateAsJson(componentTree)
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${page?.attributes.title.toLowerCase().replace(/\s+/g, "-") || "page"}.json`
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
    mutationFn: async (componentTree: ReadonlyArray<AppNode>) => {
      const page = selectCurrentPage({
        componentTree,
        activePage: state.activePage,
      }) as AppNode | undefined
      const data = serializeAppStateAsShortcode(componentTree)
      const blob = new Blob([data], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${page?.attributes.title.toLowerCase().replace(/\s+/g, "-") || "page"}.txt`
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
    mutationFn: async (componentTree: ReadonlyArray<AppNode>) => {
      const htmlTemplate = serializeAppStateAsHtml(componentTree, {
        assetBaseUrl: window.location.origin,
      })

      // Create and download the HTML file
      const blob = new Blob([htmlTemplate], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const page = selectCurrentPage({
        componentTree,
        activePage: state.activePage,
      }) as AppNode | undefined
      a.download = `${page?.attributes.title.toLowerCase().replace(/\s+/g, "-") || "page"}.html`
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
    mutationFn: async (file: File): Promise<typeof state.componentTree> => {
      validateImportedFile(file, "json")
      const content = await readTextFile(file)

      try {
        return deserializeAppStateFromJson(content) as AppNode[]
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown parse error"
        throw new Error(`This JSON file is not a valid LivePage export: ${message}`)
      }
    },
    onSuccess: (loadedComponentTree) => {
      const page = loadedComponentTree[0] as unknown as AppNode | undefined
      toast({
        title: "Page loaded",
        description: `${page?.attributes.title ?? "Untitled Page"} has been loaded successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error loading page",
        description: error instanceof Error ? error.message : "The selected file could not be imported.",
        variant: "destructive",
      })
    },
  })

  const loadPageFromShortcodeMutation = useMutation({
    mutationFn: async (file: File): Promise<typeof state.componentTree> => {
      validateImportedFile(file, "shortcode")
      const content = await readTextFile(file)

      try {
        return deserializeAppStateFromShortcode(content) as AppNode[]
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown parse error"
        throw new Error(`This shortcode file is not a valid LivePage export: ${message}`)
      }
    },
    onSuccess: (loadedComponentTree) => {
      const page = loadedComponentTree[0] as unknown as AppNode | undefined
      toast({
        title: "Page loaded",
        description: `${page?.attributes.title ?? "Untitled Page"} has been loaded successfully.`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error loading page",
        description: error instanceof Error ? error.message : "The selected file could not be imported.",
        variant: "destructive",
      })
    },
  })

  return {
    savePageAsShortcodeMutation,
    savePageAsJsonMutation,
    savePageAsHtmlMutation,
    loadPageFromJsonMutation: loadPageFromJsonMutation,
    loadPageFromShortcodeMutation,
  }
}

export function useComponentOperations(dispatch: React.Dispatch<AppAction>, state: AppState) {
  // Find a component by ID (including nested components)
  const findComponentById = useCallback(
    (components: ReadonlyArray<AppNode | string>, id: string): AppNode | null => {
      for (const component of components) {
        if (typeof component === "string") {
          continue
        }

        if (component.attributes.id === id) {
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
  const addComponent = useCallback(({ tag, parentId, index }: { tag: string, parentId?: string, index?: number }) => {
    const componentId = generateId()
    const newComponent = createDesignComponentInstance(tag, componentId)
    dispatch({
      type: "INSERT_COMPONENT",
      payload: { newComponent, newComponentTag: tag, parentId, index },
    })

    toast({
      title: "Component added",
      description: `Added a new ${tag} component to the page.`,
    })
  }, [dispatch])

  // Update component
  const updateComponent = useCallback((id: string, updates: Partial<AppNode>) => {
    dispatch({
      type: "UPDATE_COMPONENT",
      payload: { componentId: id, updates, },
    })
  }, [dispatch])

  const setSelectedComponent = useCallback((componentId: string): void => {
    if (state.pageBuilderMode === "edit") {
      dispatch({ type: "SET_SELECTED_COMPONENT", payload: componentId })
      setTimeout(() => {
        dispatch({ type: "SET_SELECTED_COMPONENT_ANCESTORS", payload: componentId })
      }, 0);
    }
  }, [dispatch, state.pageBuilderMode])

  // Remove component
  const removeComponent = useCallback((id: string) => {
    dispatch({
      type: "REMOVE_COMPONENT",
      payload: { componentId: id },
    })

    toast({
      title: "Component removed",
      description: "The component has been removed from the page.",
    })
  }, [dispatch])

  // Duplicate component
  const duplicateComponent = useCallback((id: string) => {
    dispatch({ type: "DUPLICATE_COMPONENT", payload: { componentId: id } })

    toast({
      title: "Component duplicated",
      description: "The component has been duplicated successfully.",
    })
  }, [dispatch])

  const replaceComponent = useCallback((oldComponentId: string, newComponentTag: string) => {
    const componentId = generateId()
    const newComponent = createDesignComponentInstance(newComponentTag, componentId)
    dispatch({
      type: "REPLACE_COMPONENT",
      payload: { oldComponentId, newComponent, newComponentTag },
    })

    toast({
      title: "Component replaced",
      description: `Replaced component ${oldComponentId} with ${newComponentTag}.`,
    })
  }, [dispatch])

  const moveComponent = useCallback((componentId: string, newParentId: string, index?: number) => {
    dispatch({
      type: "MOVE_COMPONENT",
      payload: { componentId, newParentId, index },
    })

    toast({
      title: "Component moved",
      description: "The component has been moved successfully.",
    })
  }, [dispatch])

  // Duplicate page
  const duplicatePage = useCallback(() => {
    dispatch({ type: "DUPLICATE_PAGE" })
    toast({
      title: "Page duplicated",
      description: "The page has been duplicated successfully.",
    })
  }, [dispatch])

  return {
    addComponent,
    updateComponent,
    removeComponent,
    duplicateComponent,
    duplicatePage,
    setSelectedComponent,
    replaceComponent,
    moveComponent,
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
