"use client"

import {
  Command as CommandIcon,
  CornerDownLeft,
  Download,
  FileJson,
  FileText,
  LayoutTemplate,
  MonitorPlay,
  Pencil,
  Redo2,
  RotateCcw,
  Search,
  Undo2,
  Upload,
} from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/components/ui/dialog"
import { Input } from "@/client/components/ui/input"
import { toast } from "@/client/components/ui/use-toast"
import type { AppAction, AppNode, AppState, Operations } from "@/client/features/app-state"
import { selectCurrentPage } from "@/client/features/app-state"
import { componentTagList, getComponentInfo } from "@/client/features/design-components"
import type { TemplateDisplaySummary } from "@/client/features/templates"
import { cn } from "@/client/lib/utils"

type PaletteCommand = Readonly<{
  id: string
  group: string
  label: string
  description?: string
  keywords?: ReadonlyArray<string>
  icon?: React.ReactNode
  onSelect: () => void
}>

/** Depth-first walk of a page's children, skipping string (text) nodes. */
function flattenPageTree(
  node: AppNode,
  depth = 0,
  acc: Array<{ node: AppNode; depth: number }> = [],
): Array<{ node: AppNode; depth: number }> {
  for (const child of node.children) {
    if (typeof child === "string") continue
    acc.push({ node: child, depth })
    flattenPageTree(child, depth + 1, acc)
  }
  return acc
}

function previewText(node: AppNode): string | undefined {
  const firstStringChild = node.children.find((child): child is string => typeof child === "string")
  return firstStringChild?.slice(0, 40)
}

export const CommandPalette: React.FC<
  Readonly<{
    open: boolean
    onOpenChange: (open: boolean) => void
    state: AppState
    dispatch: React.Dispatch<AppAction>
    componentOperations: Operations
    templates: ReadonlyArray<TemplateDisplaySummary>
    onApplyTemplate: (templateId: string) => void
    onSaveAsJson: () => void
    onSaveAsShortcode: () => void
    onSaveAsHtml: () => void
    onImportJson: () => void
    onImportShortcode: () => void
    onDiscardChanges: () => void
  }>
> = ({
  open,
  onOpenChange,
  state,
  dispatch,
  componentOperations,
  templates,
  onApplyTemplate,
  onSaveAsJson,
  onSaveAsShortcode,
  onSaveAsHtml,
  onImportJson,
  onImportShortcode,
  onDiscardChanges,
}) => {
  const [search, setSearch] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setSearch("")
    setActiveIndex(0)
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [open])

  const currentPage = selectCurrentPage(state) ?? state.componentTree[0]
  const canUndo = state.currentHistoryIndex > 0
  const canRedo = state.currentHistoryIndex < state.history.length - 1

  const jumpToHistory = useCallback(
    (index: number) => {
      const entry = state.history[index]
      if (!entry) return
      const wasUndo = index < state.currentHistoryIndex
      dispatch({ type: "SET_PAGES", payload: JSON.parse(JSON.stringify(entry.pageState)) })
      dispatch({ type: "SET_CURRENT_HISTORY_INDEX", payload: index })
      // Clear any in-flight preview from the History popover (RESTORE_FROM_HISTORY
      // sets these two fields without committing). Leaving them stale would let a
      // later "Discard" in that popover silently revert this undo/redo.
      dispatch({ type: "SET_HISTORY_PREVIEW_INDEX", payload: null })
      dispatch({ type: "SET_ORIGINAL_HISTORY_STATE", payload: null })
      toast({ title: wasUndo ? "Undid last change" : "Redid change" })
    },
    [dispatch, state.currentHistoryIndex, state.history],
  )

  const commands = useMemo<ReadonlyArray<PaletteCommand>>(() => {
    const actionCommands: PaletteCommand[] = [
      {
        id: "action-toggle-mode",
        group: "Actions",
        label: state.pageBuilderMode === "edit" ? "Switch to preview mode" : "Switch to edit mode",
        keywords: ["preview", "edit", "mode"],
        icon: state.pageBuilderMode === "edit" ? <MonitorPlay className="h-4 w-4" /> : <Pencil className="h-4 w-4" />,
        onSelect: () =>
          dispatch({
            type: "SET_PAGE_BUILDER_MODE",
            payload: state.pageBuilderMode === "edit" ? "preview" : "edit",
          }),
      },
      {
        id: "action-undo",
        group: "Actions",
        label: "Undo last change",
        description: canUndo ? undefined : "Nothing to undo",
        keywords: ["undo", "back", "history"],
        icon: <Undo2 className="h-4 w-4" />,
        onSelect: () => {
          if (canUndo) jumpToHistory(state.currentHistoryIndex - 1)
        },
      },
      {
        id: "action-redo",
        group: "Actions",
        label: "Redo change",
        description: canRedo ? undefined : "Nothing to redo",
        keywords: ["redo", "forward", "history"],
        icon: <Redo2 className="h-4 w-4" />,
        onSelect: () => {
          if (canRedo) jumpToHistory(state.currentHistoryIndex + 1)
        },
      },
      {
        id: "action-discard",
        group: "Actions",
        label: "Discard all changes",
        keywords: ["discard", "reset", "revert"],
        icon: <RotateCcw className="h-4 w-4" />,
        onSelect: onDiscardChanges,
      },
      {
        id: "action-save-json",
        group: "Actions",
        label: "Save page as JSON",
        keywords: ["save", "export", "json", "download"],
        icon: <FileJson className="h-4 w-4" />,
        onSelect: onSaveAsJson,
      },
      {
        id: "action-save-shortcode",
        group: "Actions",
        label: "Save page as Shortcode",
        keywords: ["save", "export", "shortcode", "download"],
        icon: <FileText className="h-4 w-4" />,
        onSelect: onSaveAsShortcode,
      },
      {
        id: "action-save-html",
        group: "Actions",
        label: "Export page as HTML",
        keywords: ["export", "html", "download"],
        icon: <Download className="h-4 w-4" />,
        onSelect: onSaveAsHtml,
      },
      {
        id: "action-import-json",
        group: "Actions",
        label: "Import page from JSON",
        keywords: ["import", "load", "json", "upload"],
        icon: <Upload className="h-4 w-4" />,
        onSelect: onImportJson,
      },
      {
        id: "action-import-shortcode",
        group: "Actions",
        label: "Import page from Shortcode",
        keywords: ["import", "load", "shortcode", "upload"],
        icon: <Upload className="h-4 w-4" />,
        onSelect: onImportShortcode,
      },
    ]

    const insertParentId = state.selectedComponentId || currentPage?.attributes.id
    const insertCommands: PaletteCommand[] = componentTagList.map((tag) => {
      const info = getComponentInfo(tag)
      return {
        id: `insert-${tag}`,
        group: "Insert component",
        label: `Insert ${info.label}`,
        description: state.selectedComponentId ? "Inside the selected component" : "Onto the current page",
        keywords: [tag, ...info.keywords],
        icon: info.Icon,
        onSelect: () => componentOperations.addComponent({ tag, parentId: insertParentId }),
      }
    })

    const templateCommands: PaletteCommand[] = templates.map((template) => ({
      id: `template-${template.id}`,
      group: "Templates",
      label: `Apply template: ${template.name}`,
      description: template.description,
      keywords: [template.category, ...template.tags],
      icon: <LayoutTemplate className="h-4 w-4" />,
      onSelect: () => {
        onApplyTemplate(template.id)
        toast({ title: "Template applied", description: template.name })
      },
    }))

    const jumpCommands: PaletteCommand[] =
      state.pageBuilderMode === "edit" && currentPage
        ? flattenPageTree(currentPage).map(({ node, depth }) => {
            const info = getComponentInfo(node.tag)
            const preview = previewText(node)
            return {
              id: `jump-${node.attributes.id}`,
              group: "Jump to component",
              label: `${"  ".repeat(depth)}${info.label}`,
              description: preview ? `“${preview}”` : node.attributes.id,
              keywords: [node.tag, node.attributes.id, preview ?? ""],
              icon: info.Icon,
              onSelect: () => componentOperations.setSelectedComponent(node.attributes.id),
            }
          })
        : []

    return [...actionCommands, ...insertCommands, ...templateCommands, ...jumpCommands]
  }, [
    state.pageBuilderMode,
    state.selectedComponentId,
    state.currentHistoryIndex,
    state.history,
    canUndo,
    canRedo,
    currentPage,
    componentOperations,
    templates,
    dispatch,
    jumpToHistory,
    onApplyTemplate,
    onDiscardChanges,
    onSaveAsHtml,
    onSaveAsJson,
    onSaveAsShortcode,
    onImportJson,
    onImportShortcode,
  ])

  const filteredCommands = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return commands
    return commands.filter((command) => {
      const haystack = [command.label, command.description ?? "", ...(command.keywords ?? [])]
        .join(" ")
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [commands, search])

  // Precompute id -> index once per filter pass instead of calling
  // filteredCommands.indexOf(command) inside the render loop (O(n) per row,
  // O(n^2) per render on every keystroke).
  const commandIndexById = useMemo(() => {
    const map = new Map<string, number>()
    filteredCommands.forEach((command, index) => map.set(command.id, index))
    return map
  }, [filteredCommands])

  const groupedCommands = useMemo(() => {
    const groups = new Map<string, PaletteCommand[]>()
    for (const command of filteredCommands) {
      const list = groups.get(command.group) ?? []
      list.push(command)
      groups.set(command.group, list)
    }
    return Array.from(groups.entries())
  }, [filteredCommands])

  useEffect(() => {
    setActiveIndex(0)
  }, [search])

  const runCommand = useCallback(
    (command: PaletteCommand | undefined) => {
      if (!command) return
      command.onSelect()
      onOpenChange(false)
    },
    [onOpenChange],
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, filteredCommands.length - 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === "Enter") {
      event.preventDefault()
      runCommand(filteredCommands[activeIndex])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="command-palette-description"
        className="grid h-[min(70vh,34rem)] w-[min(90vw,36rem)] grid-rows-[auto_1fr_auto] p-0"
      >
        <DialogHeader className="border-b-0">
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <p id="command-palette-description" className="sr-only">
            Search actions, components, and templates, then press Enter to run the highlighted command.
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search actions, components, and templates…"
              className="h-11 border-0 pl-10 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </DialogHeader>

        <div className="overflow-y-auto border-t px-2 py-2">
          {filteredCommands.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No matching commands.</p>
          ) : (
            groupedCommands.map(([group, groupCommands]) => (
              <div key={group} className="mb-2">
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group}
                </p>
                {groupCommands.map((command) => {
                  const index = commandIndexById.get(command.id) ?? 0
                  const isActive = index === activeIndex
                  return (
                    <button
                      key={command.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => runCommand(command)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm",
                        isActive ? "bg-muted text-foreground" : "text-foreground/90 hover:bg-muted/60",
                      )}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground">
                        {command.icon}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {command.label}
                        {command.description ? (
                          <span className="ml-2 truncate text-xs text-muted-foreground">{command.description}</span>
                        ) : null}
                      </span>
                      {isActive ? <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CommandIcon className="h-3 w-3" /> K to toggle
          </span>
          <span>↑↓ to navigate · ↵ to run · Esc to close</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
