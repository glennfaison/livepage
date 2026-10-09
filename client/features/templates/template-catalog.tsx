"use client"

import React from "react"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { cn } from "@/client/lib/utils"
import { Clock, ChevronLeft, ChevronRight, Grid, List, Star, X, FileText, Briefcase, Image, Mic, Mail, Utensils, GraduationCap, Newspaper, HeartPulse, Link, Monitor, Calendar, Code, User, Building2, Eye } from "lucide-react"
import type { TemplateDisplaySummary } from "./registry"
import { useTemplateCatalog, type CatalogTab, type CatalogViewMode } from "./use-template-catalog"
import { TemplatePreviewModal } from "./template-preview-modal"

export type { CatalogViewMode } from "./use-template-catalog"

function getCategoryIcon(category: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    "Landing Page": <Monitor className="h-4 w-4" />,
    Event: <Calendar className="h-4 w-4" />,
    Podcast: <Mic className="h-4 w-4" />,
    "Contact/About": <Mail className="h-4 w-4" />,
    Business: <Briefcase className="h-4 w-4" />,
    Portfolio: <Image className="h-4 w-4" />,
    "Link in Bio": <Link className="h-4 w-4" />,
    Restaurant: <Utensils className="h-4 w-4" />,
    "CV/Resume": <GraduationCap className="h-4 w-4" />,
    "CV/Resume/Personal": <User className="h-4 w-4" />,
    Blog: <Newspaper className="h-4 w-4" />,
    Dashboard: <HeartPulse className="h-4 w-4" />,
  }
  return iconMap[category] ?? <FileText className="h-4 w-4" />
}

interface TemplateCatalogProps {
  templates: ReadonlyArray<TemplateDisplaySummary>
  onApplyTemplate: (templateId: string) => void
  onClose?: () => void
  viewMode?: CatalogViewMode
  renderTemplateItem?: (template: TemplateDisplaySummary, itemProps: TemplateItemProps) => React.ReactNode
}

const TAB_TRIGGER_CLASS =
  "shrink-0 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"

const VIEW_MODES: ReadonlyArray<Readonly<{ mode: CatalogViewMode; label: string; Icon: typeof Grid }>> = [
  { mode: "grid", label: "Grid view", Icon: Grid },
  { mode: "list", label: "List view", Icon: List },
]

export function TemplateCatalog({ templates, onApplyTemplate, onClose, viewMode: forcedViewMode, renderTemplateItem }: Readonly<TemplateCatalogProps>) {
  const catalog = useTemplateCatalog(templates)
  const { visibleTemplates, searchTerm } = catalog
  const viewMode = forcedViewMode ?? catalog.viewMode
  const [previewTemplateId, setPreviewTemplateId] = React.useState<string | null>(null)

  const handleApplyTemplate = (templateId: string) => {
    catalog.recordApplied(templateId)
    onApplyTemplate(templateId)
    onClose?.()
  }

  const handlePreviewTemplate = (templateId: string) => {
    setPreviewTemplateId(templateId)
  }

  const handleClosePreview = () => {
    setPreviewTemplateId(null)
  }

  const renderTemplate = (template: TemplateDisplaySummary) => {
    const itemProps = {
      template,
      isFavorite: catalog.isFavorite(template.id),
      onToggleFavorite: () => catalog.toggleFavorite(template.id),
      onApply: () => handleApplyTemplate(template.id),
      onPreview: () => handlePreviewTemplate(template.id),
    }
    if (renderTemplateItem) return <React.Fragment key={template.id}>{renderTemplateItem(template, itemProps)}</React.Fragment>
    return viewMode === "grid" ? <TemplateCard key={template.id} {...itemProps} /> : <TemplateListItem key={template.id} {...itemProps} />
  }

  const handleClearSearch = () => catalog.setSearchTerm("")

  return (
    <React.Fragment>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 space-y-3 p-4 pb-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Template catalog</h2>
            <span className="text-xs text-muted-foreground">
              {visibleTemplates.length} {visibleTemplates.length === 1 ? "template" : "templates"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Choose a starting point tailored to the kind of page you want to build.</p>
        </div>

        <div className="relative">
          <Input
            value={catalog.searchTerm}
            onChange={(event) => catalog.setSearchTerm(event.target.value)}
            placeholder="Search templates by name, tag, or category"
            aria-label="Search templates"
            autoComplete="off"
            className={cn(searchTerm && "pr-9")}
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Clear search"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <CategoryTabs tabs={catalog.tabs} activeTabId={catalog.activeTabId} onChange={catalog.setActiveTabId} />
          {!forcedViewMode && <ViewModeToggle value={viewMode} onChange={catalog.setViewMode} />}
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4"
        role="region"
        aria-label="Available templates"
      >
        <p className="sr-only" role="status">
          {visibleTemplates.length === 1 ? "1 template" : `${visibleTemplates.length} templates`}
        </p>
        {visibleTemplates.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            {catalog.emptyMessage}
            {searchTerm && (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleClearSearch}
                className="mt-1 inline-block text-xs"
              >
                Clear your search
              </Button>
            )}
          </p>
        ) : (
          <div
            className={cn(
              viewMode === "grid" ? "grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3" : "flex flex-col gap-2",
            )}
          >
            {visibleTemplates.map(renderTemplate)}
          </div>
        )}
      </div>
    </div>
    <TemplatePreviewModal
      templateId={previewTemplateId ?? ""}
      isOpen={previewTemplateId !== null}
      onClose={handleClosePreview}
      onApplyTemplate={handleApplyTemplate}
    />
  </React.Fragment>
)
}

function CategoryTabs({
  tabs,
  activeTabId,
  onChange,
}: Readonly<{
  tabs: ReadonlyArray<CatalogTab>
  activeTabId: string
  onChange: (tabId: string) => void
}>) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const updateScrollState = React.useCallback(() => {
    const node = listRef.current
    if (!node) return
    setCanScrollLeft(node.scrollLeft > 0)
    setCanScrollRight(node.scrollLeft < node.scrollWidth - node.clientWidth)
  }, [])

  React.useEffect(() => {
    const node = listRef.current
    if (!node) return
    updateScrollState()
    node.addEventListener("scroll", updateScrollState, { passive: true })
    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(node)
    return () => {
      node.removeEventListener("scroll", updateScrollState)
      resizeObserver.disconnect()
    }
  }, [updateScrollState])

  const scrollByOne = (direction: "left" | "right") => {
    const node = listRef.current
    if (!node) return
    const target = node.querySelector<HTMLElement>("[data-tabs-trigger]")
    const step = target ? target.getBoundingClientRect().width : node.clientWidth / 2
    node.scrollBy({ left: direction === "left" ? -step : step, behavior: "smooth" })
  }

  return (
    <div className="relative min-w-0 flex-1 border border-border flex rounded-md overflow-hidden">
      <button
        type="button"
        aria-label="Scroll categories left"
        disabled={!canScrollLeft}
        onClick={() => scrollByOne("left")}
        className="flex h-10 shrink-0 items-center justify-center rounded-l-md border-y border-l border-border bg-muted/40 px-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="relative min-w-0 flex-1 overflow-hidden ![scrollbar-width:none]">
        <Tabs value={activeTabId} onValueChange={onChange} className="min-w-0 flex-1">
          {/* The list itself is the horizontal scroller; p-1 leaves room for the focus ring, which overflow would clip. */}
          <TabsList
            ref={listRef}
            aria-label="Template categories"
            className="flex h-10 flex-1 justify-start gap-1 overflow-x-auto overscroll-x-contain bg-transparent p-1 ![scrollbar-width:none]"
          >
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} data-tabs-trigger className={TAB_TRIGGER_CLASS}>
                {tab.id === "favorites" && <Star className="h-3.5 w-3.5" aria-hidden="true" />}
                {tab.id === "recent" && <Clock className="h-3.5 w-3.5" aria-hidden="true" />}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <button
        type="button"
        aria-label="Scroll categories right"
        disabled={!canScrollRight}
        onClick={() => scrollByOne("right")}
        className="flex h-10 shrink-0 items-center justify-center rounded-r-md border-y border-r border-border bg-muted/40 px-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

function ViewModeToggle({
  value,
  onChange,
}: Readonly<{ value: CatalogViewMode; onChange: (mode: CatalogViewMode) => void }>) {
  return (
    <div role="group" aria-label="Template layout" className="flex h-10 shrink-0 items-center gap-0.5 rounded-md border border-border p-0.5">
      {VIEW_MODES.map(({ mode, label, Icon }) => (
        <button
          key={mode}
          type="button"
          aria-label={label}
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === mode && "bg-primary text-primary-foreground hover:text-primary-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

interface TemplateItemProps {
  template: TemplateDisplaySummary
  isFavorite: boolean
  onToggleFavorite: () => void
  onApply: () => void
  onPreview: () => void
}

/**
 * The whole card applies the template through one stretched button, so no interactive element is nested
 * inside another. The favorite button sits above it with `z-10`.
 */
function ApplyTemplateButton({ template, onApply, className }: Readonly<{ template: TemplateDisplaySummary; onApply: () => void; className: string }>) {
  return (
    <button
      type="button"
      onClick={onApply}
      aria-label={`Apply ${template.name} template`}
      className={cn(
        "absolute inset-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    />
  )
}

function FavoriteButton({ isFavorite, onToggle }: Readonly<{ isFavorite: boolean; onToggle: () => void }>) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
      className="relative z-10 shrink-0 rounded p-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Star
        className={cn("h-4 w-4", isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")}
        aria-hidden="true"
      />
    </button>
  )
}

function TemplateBadges({ template }: Readonly<{ template: TemplateDisplaySummary }>) {
  const primaryTag = template.tags[0] ?? template.category
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {template.category}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
        Best for {primaryTag}
      </span>
    </div>
  )
}

function TemplateTags({ template }: Readonly<{ template: TemplateDisplaySummary }>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {template.tags.slice(0, 3).map((tag) => (
        <span key={tag} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
          {tag}
        </span>
      ))}
    </div>
  )
}

function TemplateThumbnail({ template, className }: Readonly<{ template: TemplateDisplaySummary; className?: string }>) {
  const [imageError, setImageError] = React.useState(false)
  const fallbackIcon = getCategoryIcon(template.category)

  if (imageError) {
    return (
      <div
        role="img"
        aria-label={`${template.name} preview (fallback)`}
        className={cn("aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted flex items-center justify-center", className)}
      >
        <div className="text-muted-foreground/50">{fallbackIcon}</div>
      </div>
    )
  }

  return (
    <img
      src={template.thumbnail}
      alt={`${template.name} preview`}
      onError={() => setImageError(true)}
      className={cn("aspect-[4/3] w-full h-full object-cover rounded-xl border border-border bg-muted shadow-sm", className)}
    />
  )
}

export function TemplateCard({ template, isFavorite, onToggleFavorite, onApply, onPreview }: Readonly<TemplateItemProps>) {
  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-background p-3 transition-colors duration-150 hover:border-foreground/20 hover:bg-muted/35">
      <div className="relative">
        <TemplateThumbnail template={template} />
        {/* Decorative hover cue; the stretched button below is the real control. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"
        >
          <span className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg">Apply template</span>
        </div>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-2">
          <TemplateBadges template={template} />
          <h3 className="font-medium text-foreground">{template.name}</h3>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreview}
            aria-label={`Preview ${template.name} template`}
            title="Preview template"
            className="relative z-10 shrink-0"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </Button>
          <FavoriteButton isFavorite={isFavorite} onToggle={onToggleFavorite} />
        </div>
      </div>
      <TemplateTags template={template} />
      <ApplyTemplateButton template={template} onApply={onApply} className="rounded-2xl" />
    </div>
  )
}

export function TemplateListItem({ template, isFavorite, onToggleFavorite, onApply, onPreview }: Readonly<TemplateItemProps>) {
  return (
    <div className="group relative flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors duration-150 hover:border-foreground/20 hover:bg-muted/35">
      <TemplateThumbnail template={template} className="w-20 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <TemplateBadges template={template} />
        <h3 className="truncate font-medium text-foreground">{template.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{template.description}</p>
        <TemplateTags template={template} />
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreview}
          aria-label={`Preview ${template.name} template`}
          title="Preview template"
          className="relative z-10 shrink-0"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </Button>
        <FavoriteButton isFavorite={isFavorite} onToggle={onToggleFavorite} />
      </div>
      <ApplyTemplateButton template={template} onApply={onApply} className="rounded-xl" />
    </div>
  )
}
