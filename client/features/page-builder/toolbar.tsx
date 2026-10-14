import { HistoryPopover } from "@/client/features/page-builder/history-popover"
import { DiscardConfirmationDialog } from "@/client/features/page-builder/discard-confirmation-dialog"
import { ToolbarSettingsPopover } from "@/client/features/page-builder/toolbar-settings-popover"
import { Button } from "@/client/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/client/components/ui/dialog"
import type { PageBuilderMode } from "@/client/features/app-state"
import { cn } from "@/client/lib/utils"
import { Bot, Command, Copy, GripVertical, History, Maximize, Minimize, Redo, RotateCw, Save, Settings, Undo, X } from "lucide-react"
import type { HistoryEntry, AppState } from "@/client/features/types"
import type { AppAction, AppNode } from "@/client/features/types"
import { selectCurrentPage } from "@/client/features/app-state"
import { formatShortcut, useHistoryShortcut, useSaveShortcut, useUndoShortcut, useRedoShortcut, useDuplicatePageShortcut } from "@/client/features/page-builder/keyboard-shortcuts"
import { useDiscardConfirmation, useHistoryOperations } from "@/client/features/page-builder/hooks"