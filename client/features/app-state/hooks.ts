"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useToast, toast } from "@/client/components/ui/use-toast"
import { appReducer, initialState } from "@/client/features/app-state/commands/reducer"
import type { AppState, AppAction, PersistedSession } from "@/client/features/types"

const PAGE_STORAGE_KEY = "livepage-page-storage"
const PAGE_UI_STATE_KEY = "livepage-page-ui-state"
const PROMPT_ASSIST_ENABLED_KEY = "livepage-prompt-assist-enabled"
const STORAGE_LOCK = "livepage-page-storage"
const SAVE_DELAY_MS = 500

interface PersistedDocument {
  rev?: number
  componentTree: AppState["componentTree"]
}

interface PersistedDocumentEnvelope {
  rev: number
  componentTree: AppState["componentTree"]
}

interface PersistedUIState {
  activePage: string
  pageBuilderMode: AppState["pageBuilderMode"]
  toolbarMinimized: boolean
}

type PersistResult = { ok: true } | { ok: false; error: Error }

/**
 * One shared app store per tab with revision-guarded persistence.
 *
 * Every `useAppState()` caller reads the same module-level `currentState` and
 * dispatches through the same module-level `dispatch`, so there is exactly one
 * reducer, one debounced save, and one `localStorage` writer per tab. This
 * prevents a second `useAppState()` instance (for example inside
 * `SettingsPopover`) from hydrating a stale snapshot and clobbering the first
 * instance's in-flight write to `livepage-page-storage` (#325).
 *
 * Persistence is revision-guarded (#458): the document is stored as an envelope
 * `{ rev, componentTree }`. Each tab keeps a `baseRev` (the revision it last
 * loaded or wrote). At flush time, inside `navigator.locks.request(...)`, a
 * write is accepted only when the stored revision still equals `baseRev`;
 * otherwise the tab is marked `stale` and the unsaved edit stays in memory.
 * UI fields live under a separate last-write-wins key so a stale tab that only
 * toggles the toolbar cannot clobber another tab's document.
 */
let currentState: AppState = initialState
const listeners = new Set<() => void>()
let saveTimeoutRef: ReturnType<typeof setTimeout> | null = null
let setToastRef: ((props: Parameters<typeof toast>[0]) => void) | null = null
let hydrated = false
let listenerCount = 0
let baseRev = 0
let dirty = false
let persistenceListenersInstalled = false
let discardedInvalidPersisted = false

function resetStore() {
  currentState = initialState
  baseRev = 0
  dirty = false
  hydrated = false
  if (saveTimeoutRef) {
    clearTimeout(saveTimeoutRef)
    saveTimeoutRef = null
  }
}

function notify() {
  for (const fn of listeners) fn()
}

function subscribe(callback: () => void) {
  if (listenerCount === 0) {
    resetStore()
  }
  listenerCount += 1
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
    listenerCount -= 1
    if (listenerCount === 0) {
      resetStore()
    }
  }
}

function getSnapshot(): AppState {
  return currentState
}

function getServerSnapshot(): AppState {
  return initialState
}

/** Document-changing actions mutate `componentTree`. They are gated when stale. */
function isDocumentChange(action: AppAction): boolean {
  switch (action.type) {
    case "INSERT_COMPONENT":
    case "UPDATE_COMPONENT":
    case "REMOVE_COMPONENT":
    case "DUPLICATE_COMPONENT":
    case "REPLACE_COMPONENT":
    case "MOVE_COMPONENT":
    case "SET_PAGES":
    case "ADD_PAGE":
    case "UPDATE_PAGE":
    case "DUPLICATE_PAGE":
    case "RESTORE_FROM_HISTORY":
    case "DISCARD_CHANGES":
      return true
    default:
      return false
  }
}

function isUIAction(action: AppAction): boolean {
  switch (action.type) {
    case "SET_ACTIVE_PAGE":
    case "SET_PAGE_BUILDER_MODE":
    case "SET_TOOLBAR_MINIMIZED":
      return true
    default:
      return false
  }
}

function loadPersistedDocument(): PersistedDocument | null {
  if (typeof window === "undefined") return null
  try {
    const stored = window.localStorage.getItem(PAGE_STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as PersistedDocument
    if (!parsed || !parsed.componentTree) return null
    // Lazy require to avoid circular dependency with design-components -> app-state
    const { appNodeTreeSchema } = require("@/client/features/serializers/schema")
    const validation = appNodeTreeSchema.safeParse(parsed.componentTree)
    if (!validation.success) {
      discardedInvalidPersisted = true
      try {
        window.localStorage.removeItem(PAGE_STORAGE_KEY)
      } catch {
        // ignore
      }
      return null
    }
    return { ...parsed, componentTree: validation.data }
  } catch {
    return null
  }
}

function documentRev(document: PersistedDocument): number {
  return typeof document.rev === "number" ? document.rev : 0
}

function savePersistedDocument(componentTree: AppState["componentTree"], rev: number): PersistResult {
  if (typeof window === "undefined") return { ok: true }
  try {
    const envelope: PersistedDocumentEnvelope = { rev, componentTree }
    window.localStorage.setItem(PAGE_STORAGE_KEY, JSON.stringify(envelope))
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

function loadPersistedUIState(): PersistedUIState | null {
  if (typeof window === "undefined") return null
  try {
    const stored = window.localStorage.getItem(PAGE_UI_STATE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as PersistedUIState
  } catch {
    return null
  }
}

function savePersistedUIState(ui: PersistedUIState): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(PAGE_UI_STATE_KEY, JSON.stringify(ui))
  } catch {
    // UI fields are last-write-wins; ignore storage failures (private mode, quota).
  }
}

function readPersistedSession(): PersistedSession {
  const stored = loadPersistedDocument()
  let storedPromptAssist: string | null = null
  try {
    storedPromptAssist = window.localStorage.getItem(PROMPT_ASSIST_ENABLED_KEY)
  } catch {
    // Storage can be unavailable (private mode, quota); the defaults then apply.
  }
  return {
    componentTree: stored?.componentTree ?? null,
    promptAssistEnabled: storedPromptAssist === null ? null : storedPromptAssist === "true",
  }
}

function scheduleSave(state: AppState) {
  if (saveTimeoutRef) {
    clearTimeout(saveTimeoutRef)
  }
  saveTimeoutRef = setTimeout(() => {
    saveTimeoutRef = null
    flushSave(state)
  }, SAVE_DELAY_MS)
}

async function withDocumentLock(fn: () => void): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    await navigator.locks.request(STORAGE_LOCK, { mode: "exclusive" }, () => {
      fn()
    })
    return
  }
  // Fallback when navigator.locks is unavailable: explicit check-then-write.
  fn()
}

function flushSave(state: AppState) {
  if (state.stale || !dirty) return

  const write = () => {
    const stored = loadPersistedDocument()
    const storedRev = stored ? documentRev(stored) : 0
    if (storedRev !== baseRev) {
      // Another tab won the race: mark stale, keep the unsaved edit in memory.
      setStale(true)
      return
    }
    const result = savePersistedDocument(state.componentTree, baseRev + 1)
    if (result.ok) {
      baseRev += 1
      dirty = false
      return
    }
    const error = result.error
    if (setToastRef) {
      setToastRef({
        title: "Could not save page",
        description:
          error.name === "QuotaExceededError"
            ? "Browser storage is full. Free up space or reduce the page size to keep saving."
            : "Page state could not be saved to browser storage.",
        variant: "destructive",
      })
    }
  }

  void withDocumentLock(write)
}

function setStale(stale: boolean) {
  dispatch({ type: "SET_STALE", payload: stale })
  if (stale && saveTimeoutRef) {
    clearTimeout(saveTimeoutRef)
    saveTimeoutRef = null
  }
}

function dispatch(action: AppAction) {
  if (currentState.stale && isDocumentChange(action)) {
    // While stale, reject every document-changing action. The unsaved edit
    // stays in memory until the user resolves the stale lock.
    return currentState
  }
  currentState = appReducer(currentState, action)
  if (isDocumentChange(action)) {
    dirty = true
  } else if (isUIAction(action)) {
    savePersistedUIState({
      activePage: currentState.activePage,
      pageBuilderMode: currentState.pageBuilderMode,
      toolbarMinimized: currentState.toolbarMinimized,
    })
  }
  notify()
  if (dirty && !currentState.stale) {
    scheduleSave(currentState)
  }
  return currentState
}

/**
 * Adopt state directly, bypassing the stale gate. Used for hydration and for
 * stale-tab recovery ("Load latest" / "Overwrite"), which must be able to
 * reload or overwrite the document even while the tab is stale.
 */
function adopt(patch: Partial<AppState>, options: { baseRev?: number; dirty?: boolean } = {}) {
  currentState = { ...currentState, ...patch }
  if (options.baseRev !== undefined) baseRev = options.baseRev
  if (options.dirty !== undefined) dirty = options.dirty
  notify()
  if (dirty && !currentState.stale) {
    scheduleSave(currentState)
  }
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key === PAGE_STORAGE_KEY) {
    setStale(true)
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") {
    const stored = loadPersistedDocument()
    const storedRev = stored ? documentRev(stored) : 0
    if (storedRev !== baseRev) {
      setStale(true)
    }
  }
}

export function installPersistenceListeners() {
  if (typeof window === "undefined") return
  window.addEventListener("storage", handleStorageEvent)
  window.addEventListener("visibilitychange", handleVisibilityChange)
}

export function uninstallPersistenceListeners() {
  if (typeof window === "undefined") return
  window.removeEventListener("storage", handleStorageEvent)
  window.removeEventListener("visibilitychange", handleVisibilityChange)
}

/** Returns the stored revisioned document, if any. */
export function loadStoredDocument(): PersistedDocument | null {
  return loadPersistedDocument()
}

/** Reload the stored tree, clear history, and clear the stale lock ("Load latest here"). */
export function recoverLoadLatest(): void {
  const stored = loadPersistedDocument()
  if (!stored) return
  const tree = stored.componentTree
  const rev = documentRev(stored)
  adopt(
    {
      componentTree: tree,
      activePage: currentState.activePage,
      pageBuilderMode: currentState.pageBuilderMode,
      toolbarMinimized: currentState.toolbarMinimized,
      promptAssistEnabled: currentState.promptAssistEnabled,
      stale: false,
      history: [],
      currentHistoryIndex: -1,
      historyPreviewIndex: null,
      originalHistoryState: null,
    },
    { baseRev: rev, dirty: false },
  )
  if (tree && currentState.history.length === 0) {
    dispatch({ type: "ADD_TO_HISTORY", payload: { action: "Page created", pageState: tree } })
  }
}

/** Keep this tab's tree, mark it current, and overwrite the stored revision ("Overwrite with this tab"). */
export function recoverOverwrite(): void {
  const stored = loadPersistedDocument()
  if (!stored) return
  const rev = documentRev(stored)
  adopt({ stale: false }, { baseRev: rev, dirty: true })
}

/**
 * Hook that provides the global app state and dispatch function.
 * Every caller shares the one tab-wide store, so a single debounced save
 * writes to `livepage-page-storage` and no instance can clobber another.
 */
export function useAppState() {
  const { toast } = useToast()
  setToastRef = toast

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Adopt the browser-persisted session once per tab, after mount, so the
  // first render stays identical to the server HTML. Hydration never writes.
  useEffect(() => {
    if (hydrated) return
    hydrated = true
    if (!persistenceListenersInstalled) {
      installPersistenceListeners()
      persistenceListenersInstalled = true
    }
    const stored = loadPersistedDocument()
    const session = readPersistedSession()
    baseRev = stored ? documentRev(stored) : 0
    dirty = false
    const ui = loadPersistedUIState()
    const componentTree = session.componentTree ?? currentState.componentTree
    adopt(
      {
        componentTree,
        activePage: ui?.activePage ?? currentState.activePage,
        pageBuilderMode: ui?.pageBuilderMode ?? currentState.pageBuilderMode,
        toolbarMinimized: ui?.toolbarMinimized ?? currentState.toolbarMinimized,
        promptAssistEnabled: session.promptAssistEnabled ?? currentState.promptAssistEnabled,
        stale: false,
      },
      { baseRev, dirty: false },
    )
    if (currentState.history.length === 0) {
      dispatch({ type: "ADD_TO_HISTORY", payload: { action: "Page created", pageState: componentTree } })
    }
    if (discardedInvalidPersisted && setToastRef) {
      setToastRef({
        title: "Saved page was incompatible",
        description: "The previously saved page contained unknown or invalid components and was reset to a blank page.",
        variant: "destructive",
      })
      discardedInvalidPersisted = false
    }
  }, [])

  return { state, dispatch }
}
