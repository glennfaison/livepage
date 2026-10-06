"use client"

import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/client/components/ui/popover"
import { Switch } from "@/client/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import type { TemplateDisplaySummary } from "./registry"
import { LayoutTemplate, Grid, List, Star, StarOff, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const RECENTLY_USED_KEY = "livepage-recently-used-templates"
const FAVORITES_KEY = "livepage-favorite-templates"
const MAX_RECENT = 5

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function TemplateCatalogPopover({
  templates,
  onApplyTemplate,
}: Readonly<{
  templates: ReadonlyArray<TemplateDisplaySummary>
  onApplyTemplate: (templateId: string) => void
}>) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(null)
  const [recentlyUsed, setRecentlyUsed] = useState<ReadonlyArray<string>>([])
  const [favorites, setFavorites] = useState<ReadonlyArray<string>>([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [showRecent, setShowRecent] = useState(false)

  useEffect(() => {
    setRecentlyUsed(getStored(RECENTLY_USED_KEY, []))
    setFavorites(getStored(FAVORITES_KEY, []))
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories = new Set(templates.map((t) => t.category))
    return ["all", ...Array.from(uniqueCategories).sort()]
  }, [templates])

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredTemplates = useMemo(() => {
    let baseTemplates = templates

    if (showFavorites) {
      baseTemplates = templates.filter((t) => favorites.includes(t.id))
    } else if (showRecent) {
      baseTemplates = recentlyUsed
        .map((id) => templates.find((t) => t.id === id))
        .filter((t): t is TemplateDisplaySummary => t !== undefined)
    }

    return baseTemplates.filter((template) => {
      const matchesSearch =
        !normalizedSearchTerm ||
        [
          template.name,
          template.description,
          template.category,
          ...template.tags,
        ].some((value) => value.toLowerCase().includes(normalizedSearchTerm))
      const matchesCategory =
        selectedCategory === "all" || template.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [normalizedSearchTerm, selectedCategory, templates, favorites, recentlyUsed, showFavorites, showRecent])

  const handleApplyTemplate = (templateId: string) => {
    onApplyTemplate(templateId)
    setOpen(false)

    setRecentlyUsed((prev) => {
      const next = [templateId, ...prev.filter((id) => id !== templateId)].slice(0, MAX_RECENT)
      setStored(RECENTLY_USED_KEY, next)
      return next
    })
  }

  const toggleFavorite = (templateId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setFavorites((prev) => {
      const next = prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId]
      setStored(FAVORITES_KEY, next)
      return next
    })
  }

  const isFavorite = (templateId: string) => favorites.includes(templateId)

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setShowFavorites(false)
    setShowRecent(false)
  }

  const allCategories = useMemo(() => {
    const uniqueCategories = new Set(templates.map((t) => t.category))
    return Array.from(uniqueCategories).sort()
  }, [templates])

  const hasFavorites = favorites.length > 0
  const hasRecent = recentlyUsed.length > 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 px-2 sm:px-3" aria-label="Templates">
          <LayoutTemplate className="h-4 w-4" />
          <span className="hidden sm:inline">Templates</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(52rem,calc(100vw-2rem))] max-h-[min(80vh,48rem)] overflow-hidden p-4">
        <div className="flex max-h-[calc(min(80vh,48rem)-2rem)] min-h-0 flex-col gap-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Template catalog</h2>
            <p className="text-sm text-muted-foreground">Choose a starting point tailored to the kind of page you want to build.</p>
          </div>

          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search templates by name, tag, or category"
            aria-label="Search templates"
          />

          <div className="flex items-center justify-between gap-2">
            <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="flex-1">
              <TabsList className="w-full bg-transparent p-0" aria-label="Template categories">
                <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  All
                </TabsTrigger>
                {allCategories.map((category) => (
                  <TabsTrigger key={category} value={category} className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    {category}
                  </TabsTrigger>
                ))}
                {hasFavorites && (
                  <TabsTrigger value="favorites" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Star className="h-3.5 w-3.5" aria-hidden="true" />
                  </TabsTrigger>
                )}
                {hasRecent && (
                  <TabsTrigger value="recent" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground hidden sm:inline">View</span>
              <Switch
                checked={viewMode === "list"}
                onCheckedChange={(checked) => setViewMode(checked ? "list" : "grid")}
                aria-label={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
              >
                <span className="sr-only">{viewMode === "grid" ? "List view" : "Grid view"}</span>
              </Switch>
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                <Grid className={cn("h-3.5 w-3.5", viewMode === "grid" ? "text-foreground" : "text-muted-foreground")} aria-hidden="true" />
                <List className={cn("h-3.5 w-3.5", viewMode === "list" ? "text-foreground" : "text-muted-foreground")} aria-hidden="true" />
              </div>
            </div>
          </div>

          <div
            className="min-h-0 overflow-y-auto overflow-x-hidden pr-1"
            role="region"
            aria-label="Available templates"
          >
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    hovered={hoveredTemplateId === template.id}
                    onHover={() => setHoveredTemplateId(template.id)}
                    onLeave={() => setHoveredTemplateId(null)}
                    isFavorite={isFavorite(template.id)}
                    onToggleFavorite={toggleFavorite}
                    onApply={() => handleApplyTemplate(template.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTemplates.map((template) => (
                  <TemplateListItem
                    key={template.id}
                    template={template}
                    isFavorite={isFavorite(template.id)}
                    onToggleFavorite={toggleFavorite}
                    onApply={() => handleApplyTemplate(template.id)}
                  />
                ))}
              </div>
            )}
            {filteredTemplates.length === 0 && (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                {searchTerm || selectedCategory !== "all"
                  ? "No templates match your filters."
                  : "No templates available."}
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

import { cn } from "@/client/lib/utils"

function TemplateCard({
  template,
  hovered,
  onHover,
  onLeave,
  isFavorite,
  onToggleFavorite,
  onApply,
}: Readonly<{
  template: TemplateDisplaySummary
  hovered: boolean
  onHover: () => void
  onLeave: () => void
  isFavorite: boolean
  onToggleFavorite: (templateId: string, event: React.MouseEvent) => void
  onApply: () => void
}>) {
  const primaryTag = template.tags[0] ?? template.category

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onApply()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onApply}
      onKeyDown={handleKeyDown}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      aria-label={`Apply ${template.name} template`}
      className="group w-full rounded-2xl border border-border bg-background p-3 text-left transition-all duration-150 hover:border-foreground/20 hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 relative cursor-pointer"
    >
      <div className="space-y-3">
        <div className="relative">
          <div
            className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-cover bg-center bg-no-repeat shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
            style={{ backgroundImage: `url(${template.thumbnail})` }}
            aria-label={`${template.name} preview`}
          />
          {hovered && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onApply(); }}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm shadow-lg hover:bg-primary/90 transition-colors"
              >
                Apply Template
              </button>
            </div>
          )}
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {template.category}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
                Best for {primaryTag}
              </span>
            </div>
            <h3 className="font-medium text-foreground">{template.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
          </div>
          <button
            type="button"
            onClick={(e) => onToggleFavorite(template.id, e)}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className="shrink-0 p-1 rounded hover:bg-muted/50 transition-colors"
          >
            {isFavorite ? <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> : <StarOff className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function TemplateListItem({
  template,
  isFavorite,
  onToggleFavorite,
  onApply,
}: Readonly<{
  template: TemplateDisplaySummary
  isFavorite: boolean
  onToggleFavorite: (templateId: string, event: React.MouseEvent) => void
  onApply: () => void
}>) {
  const primaryTag = template.tags[0] ?? template.category

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onApply()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onApply}
      onKeyDown={handleKeyDown}
      aria-label={`Apply ${template.name} template`}
      className="group w-full rounded-xl border border-border bg-background p-3 text-left transition-all duration-150 hover:border-foreground/20 hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center gap-4 cursor-pointer"
    >
      <div
        className="aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-cover bg-center bg-no-repeat shadow-sm flex-shrink-0"
        style={{ backgroundImage: `url(${template.thumbnail})` }}
        aria-label={`${template.name} preview`}
      />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {template.category}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
            Best for {primaryTag}
          </span>
        </div>
        <h3 className="font-medium text-foreground truncate">{template.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{template.description}</p>
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => onToggleFavorite(template.id, e)}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className="shrink-0 p-1 rounded hover:bg-muted/50 transition-colors flex-shrink-0"
      >
        {isFavorite ? <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> : <StarOff className="h-4 w-4 text-muted-foreground" />}
      </button>
    </div>
  )
}
