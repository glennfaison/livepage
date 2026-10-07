"use client"

import { useMemo, useState } from "react"
import React from "react"
import type { TemplateDisplaySummary } from "./registry"
import { useStoredList } from "./stored-list"

const RECENTLY_USED_KEY = "livepage-recently-used-templates"
const FAVORITES_KEY = "livepage-favorite-templates"
const VIEW_MODE_KEY = "livepage-template-view-mode"
const MAX_RECENT = 5

export type CatalogViewMode = "grid" | "list"

export interface CatalogTab {
  readonly id: string
  readonly label: string
  readonly kind: "all" | "collection" | "category"
  readonly emptyMessage: string
  readonly select: (templates: ReadonlyArray<TemplateDisplaySummary>) => ReadonlyArray<TemplateDisplaySummary>
}

const ALL_TAB_ID = "all"
const FAVORITES_TAB_ID = "favorites"
const RECENT_TAB_ID = "recent"
// Category ids are prefixed so a category can never collide with a built-in tab id.
const categoryTabId = (category: string) => `category:${category}`

function matchesSearch(template: TemplateDisplaySummary, normalizedSearchTerm: string): boolean {
  if (!normalizedSearchTerm) return true
  return [template.name, template.description, template.category, ...template.tags].some((value) =>
    value.toLowerCase().includes(normalizedSearchTerm),
  )
}

export function useTemplateCatalog(templates: ReadonlyArray<TemplateDisplaySummary>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [requestedTabId, setRequestedTabId] = useState(ALL_TAB_ID)
  const [viewMode, setViewMode] = useState<CatalogViewMode>(() => {
    try {
      const stored = window.localStorage.getItem(VIEW_MODE_KEY)
      return stored === "list" ? "list" : "grid"
    } catch {
      return "grid"
    }
  })
  const [favorites, updateFavorites] = useStoredList(FAVORITES_KEY)
  const [recentlyUsed, updateRecentlyUsed] = useStoredList(RECENTLY_USED_KEY)

  React.useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_MODE_KEY, viewMode)
    } catch {
      // Storage can be unavailable (private mode, quota); the preference then simply does not persist.
    }
  }, [viewMode])

  const tabs = useMemo<ReadonlyArray<CatalogTab>>(() => {
    const categories = Array.from(new Set(templates.map((template) => template.category))).sort()
    const templatesById = new Map(templates.map((template) => [template.id, template]))
    const collectionTabs: CatalogTab[] = []

    if (favorites.length > 0) {
      collectionTabs.push({
        id: FAVORITES_TAB_ID,
        label: "Favorites",
        kind: "collection",
        emptyMessage: "No favorites yet. Star a template to keep it here.",
        select: (all) => all.filter((template) => favorites.includes(template.id)),
      })
    }
    if (recentlyUsed.length > 0) {
      collectionTabs.push({
        id: RECENT_TAB_ID,
        label: "Recently used",
        kind: "collection",
        emptyMessage: "Templates you apply will show up here.",
        // Most recently applied first, skipping templates that no longer exist.
        select: () =>
          recentlyUsed.flatMap((id) => {
            const template = templatesById.get(id)
            return template ? [template] : []
          }),
      })
    }

    return [
      { id: ALL_TAB_ID, label: "All", kind: "all", emptyMessage: "No templates available.", select: (all) => all },
      ...collectionTabs,
      ...categories.map<CatalogTab>((category) => ({
        id: categoryTabId(category),
        label: category,
        kind: "category",
        emptyMessage: "No templates in this category.",
        select: (all) => all.filter((template) => template.category === category),
      })),
    ]
  }, [templates, favorites, recentlyUsed])

  // A tab can disappear (for example the last favorite is removed while viewing Favorites); fall back to All.
  const activeTab = tabs.find((tab) => tab.id === requestedTabId) ?? tabs[0]

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const visibleTemplates = useMemo(
    () => activeTab.select(templates).filter((template) => matchesSearch(template, normalizedSearchTerm)),
    [activeTab, templates, normalizedSearchTerm],
  )

  const emptyMessage = normalizedSearchTerm ? "No templates match your search." : activeTab.emptyMessage

  const isFavorite = (templateId: string) => favorites.includes(templateId)

  const toggleFavorite = (templateId: string) => {
    updateFavorites((current) =>
      current.includes(templateId) ? current.filter((id) => id !== templateId) : [...current, templateId],
    )
  }

  const recordApplied = (templateId: string) => {
    updateRecentlyUsed((current) => [templateId, ...current.filter((id) => id !== templateId)].slice(0, MAX_RECENT))
  }

  return {
    searchTerm,
    setSearchTerm,
    tabs,
    activeTabId: activeTab.id,
    setActiveTabId: setRequestedTabId,
    viewMode,
    setViewMode,
    visibleTemplates,
    emptyMessage,
    isFavorite,
    toggleFavorite,
    recordApplied,
  }
}
