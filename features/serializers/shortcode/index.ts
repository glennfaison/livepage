import type { AppNode } from "@/features/app-state"
import * as ShortcodeParser from "@/features/shortcode-parser/parser"
import type { Node as ShortcodeNode } from "@/features/shortcode-parser/parser"
import { appNodeTreeSchema } from "../schema"

export function serializeAppStateAsShortcode(componentTree: ReadonlyArray<AppNode>): string {
  return ShortcodeParser.stringify([...componentTree] as ShortcodeNode[])
}

export function deserializeAppStateFromShortcode(input: string): ReadonlyArray<AppNode> {
  return appNodeTreeSchema.parse(ShortcodeParser.parse(input) as unknown)
}
