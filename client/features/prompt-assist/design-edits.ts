import type { AppNode } from "@/client/features/app-state"
import { findComponentById, patchComponent } from "@/shared/features/app-state/tree"
import { applySettingValue, describeEditableSettings, readSettingValue } from "@/client/features/design-components"
import { toSettingDescriptor } from "./page-description"
import type { DesignEdit } from "@/shared/features/prompt-assist/contract/schema"
import { filterDesignEdits } from "@/shared/features/prompt-assist/contract/setting-values"

function resolveField(pages: ReadonlyArray<AppNode>, edit: DesignEdit) {
  const node = findComponentById(pages, edit.componentId)
  const field = node ? describeEditableSettings(node.tag).find((candidate) => candidate.id === edit.setting) : undefined
  return node && field ? { node, field } : null
}

/**
 * The authoritative check before an edit touches a page, run in the browser
 * against the live component registry: the component must exist, the setting
 * must be one of its design settings, and the value must be valid and change
 * something. (The server applies the same rules to the page description it was
 * sent, but only this check speaks for the real page.)
 */
export function validateDesignEdits(pages: ReadonlyArray<AppNode>, edits: ReadonlyArray<DesignEdit>): ReadonlyArray<DesignEdit> {
  return filterDesignEdits(edits, (edit) => {
    const resolved = resolveField(pages, edit)
    return resolved && { setting: toSettingDescriptor(resolved.field), current: readSettingValue(resolved.node, resolved.field) }
  })
}

/** Applies validated edits to a copy of `pages` through each setting's own writer, leaving `pages` untouched. */
export function applyDesignEdits(pages: ReadonlyArray<AppNode>, edits: ReadonlyArray<DesignEdit>): ReadonlyArray<AppNode> {
  return validateDesignEdits(pages, edits).reduce((next, edit) => {
    const resolved = resolveField(next, edit)
    if (!resolved) return next
    const { attributes, children } = applySettingValue(resolved.node, resolved.field, edit.value)
    return patchComponent(next, edit.componentId, { attributes, children })
  }, pages)
}
