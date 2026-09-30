import type { DesignEdit, SettingDescriptor } from "./schema"

// Free text that reaches a page: bounded, printable, and never an executable URL. The scheme rule
// applies to every free-text setting rather than to particular tags or settings (href, src, ...).
const MAX_TEXT_LENGTH = 300
const CSS_COLOR = /^(#[0-9a-f]{3,8}|[a-z]{3,30}|(rgb|hsl)a?\([\d\s.,%/-]{3,40}\))$/i
const EXECUTABLE_SCHEME = /^\s*(javascript|data|vbscript):/i
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/

/** Coerces `raw` to a value the setting accepts, or returns null when it must be rejected. Pure, so server and client share it. */
function coerceSettingValue(setting: SettingDescriptor, raw: string): string | null {
  switch (setting.type) {
    case "select":
      return setting.options?.includes(raw) ? raw : null
    case "boolean":
      return raw === "true" || raw === "false" ? raw : null
    case "number": {
      const parsed = Number(raw)
      if (raw.trim() === "" || !Number.isFinite(parsed)) return null
      return String(Math.min(setting.max ?? parsed, Math.max(setting.min ?? parsed, parsed)))
    }
    case "color":
      return CSS_COLOR.test(raw.trim()) ? raw.trim() : null
    case "text":
      if (raw.length > MAX_TEXT_LENGTH || CONTROL_CHARACTERS.test(raw) || EXECUTABLE_SCHEME.test(raw)) return null
      return raw
    default:
      return null
  }
}

export type ResolvedSetting = Readonly<{ setting: SettingDescriptor; current: string }>

/**
 * Keeps only edits whose setting resolves, whose value the setting accepts,
 * and that actually change it. The last edit to a given setting wins, and a
 * setting that ends where it began is dropped. `resolve` says what a
 * setting is and what it is now, which lets the server check edits against
 * a page description and the client check them against the live registry
 * with the same rules.
 */
export function filterDesignEdits(
  edits: ReadonlyArray<DesignEdit>,
  resolve: (edit: DesignEdit) => ResolvedSetting | null,
): ReadonlyArray<DesignEdit> {
  const accepted = new Map<string, DesignEdit>()

  for (const edit of edits) {
    const resolved = resolve(edit)
    const value = resolved ? coerceSettingValue(resolved.setting, edit.value) : null
    if (value === null) continue
    // Map.set keeps the original insertion slot, so a later edit to the same setting replaces the earlier one.
    accepted.set(`${edit.componentId}\u0000${edit.setting}`, { ...edit, value })
  }

  return [...accepted.values()].filter((edit) => resolve(edit)?.current !== edit.value)
}
