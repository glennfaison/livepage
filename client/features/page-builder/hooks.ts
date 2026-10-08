"use client"

import type React from "react"

import { useMutation } from "@tanstack/react-query"
import { useCallback, useState } from "react"
import type { AppState, AppAction, AppNode, Metadata, SettingsField } from "@/client/features/app-state"
import { selectCurrentPage } from "@/client/features/app-state"
import { createDesignComponentInstance, getComponentInfo } from "@/client/features/design-components"
import { generateId } from "@/client/lib/utils"
import { toast } from "@/client/components/ui/use-toast"
import {
  deserializeAppStateFromJson,
  deserializeAppStateFromShortcode,
  serializeAppStateAsHtml,
  serializeAppStateAsSelfContainedHtml,
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
    mutationFn: async (input: ReadonlyArray<AppNode> | { componentTree: ReadonlyArray<AppNode>, selfContained?: boolean }) => {
      const componentTree = Array.isArray(input) ? input : input.componentTree
      const selfContained = !Array.isArray(input) && Boolean(input.selfContained)
      const htmlTemplate = selfContained
        ? await serializeAppStateAsSelfContainedHtml(componentTree, {
            assetBaseUrl: window.location.origin,
          })
        : serializeAppStateAsHtml(componentTree, {
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
      const suffix = selfContained ? "-self-contained.html" : ".html"
      a.download = `${page?.attributes.title.toLowerCase().replace(/\s+/g, "-") || "page"}${suffix}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return page
    },
    onSuccess: (_page, input) => {
      const selfContained = !Array.isArray(input) && Boolean(input.selfContained)
      toast({
        title: selfContained ? "Self-contained page exported" : "Page exported",
        description: selfContained
          ? "HTML was exported with inlined CSS, embedded images, and a local React runtime."
          : "Your page has been exported as an HTML file.",
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

  return {
    addComponent,
    updateComponent,
    removeComponent,
    duplicateComponent,
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

// Stylable attribute IDs that can be copied between components
const STYLABLE_ATTRIBUTE_IDS = [
  "custom-classes",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "align-items",
  "justify-content",
  "gap",
  "text-align",
  "font-size",
  "font-weight",
  "font-style",
  "text-color",
  "line-height",
  "child-sizing",
  "wrap",
]

/**
 * Extracts stylable attributes from a component.
 * Returns a record of attribute IDs to their values.
 */
export function extractStylableAttributes(component: AppNode): Record<string, string> {
  const stylableAttrs: Record<string, string> = {}
  for (const attrId of STYLABLE_ATTRIBUTE_IDS) {
    const value = component.attributes[attrId]
    if (value !== undefined && value !== "") {
      stylableAttrs[attrId] = value
    }
  }
  return stylableAttrs
}

/**
 * Filters stylable attributes to only include those valid for the target component type.
 * Checks the target component's metadata to see which attributes it supports.
 */
export function filterAttributesForComponent(
  attributes: Record<string, string>,
  targetComponentTag: string
): Record<string, string> {
  try {
    const metadata = getComponentInfo(targetComponentTag)
    const validAttrIds = new Set(
      metadata.attributes
        .filter((attr) => attr.type !== "group" && attr.type !== "divider")
        .map((attr) => attr.id)
    )
    
    // Also include nested group fields
    for (const attr of metadata.attributes) {
      if (attr.type === "group") {
        for (const field of attr.fields) {
          validAttrIds.add(field.id)
        }
      }
    }
    
    const filtered: Record<string, string> = {}
    for (const [attrId, value] of Object.entries(attributes)) {
      if (validAttrIds.has(attrId)) {
        filtered[attrId] = value
      }
    }
    return filtered
  } catch {
    // If component metadata not found, return all attributes
    return attributes
  }
}

/**
 * Hook for format painter (copy/paste styles) functionality.
 */
export function useFormatPainter() {
  const [copiedStyles, setCopiedStyles] = useState<Record<string, string> | null>(null)
  const [copiedFromTag, setCopiedFromTag] = useState<string | null>(null)

  const copyStyles = useCallback((component: AppNode) => {
    const styles = extractStylableAttributes(component)
    if (Object.keys(styles).length === 0) {
      toast({
        title: "No styles to copy",
        description: "The selected component has no stylable attributes.",
      })
      return false
    }
    setCopiedStyles(styles)
    setCopiedFromTag(component.tag)
    toast({
      title: "Styles copied",
      description: `Copied ${Object.keys(styles).length} style attribute(s) from ${component.tag}.`,
    })
    return true
  }, [])

  const pasteStyles = useCallback((
    targetComponent: AppNode,
    componentOperations: { updateComponent: (id: string, updates: Partial<AppNode>) => void }
  ) => {
    if (!copiedStyles) {
      toast({
        title: "No styles to paste",
        description: "Copy styles from a component first (⌘⌥C).",
      })
      return false
    }

    const filteredStyles = filterAttributesForComponent(copiedStyles, targetComponent.tag)
    
    if (Object.keys(filteredStyles).length === 0) {
      toast({
        title: "No compatible styles",
        description: `None of the copied styles apply to ${targetComponent.tag} components.`,
      })
      return false
    }

    componentOperations.updateComponent(targetComponent.attributes.id, {
      attributes: filteredStyles,
    })

    toast({
      title: "Styles pasted",
      description: `Applied ${Object.keys(filteredStyles).length} style attribute(s) to ${targetComponent.tag}.`,
    })
    return true
  }, [copiedStyles])

  const clearStyles = useCallback(() => {
    setCopiedStyles(null)
    setCopiedFromTag(null)
  }, [])

  const hasCopiedStyles = copiedStyles !== null

  return {
    copyStyles,
    pasteStyles,
    clearStyles,
    hasCopiedStyles,
    copiedStyles,
    copiedFromTag,
  }
}
