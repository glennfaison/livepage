import type { AppNode } from "@/shared/features/types"
import * as ShortcodeParser from "@/shared/features/shortcode-parser/parser"
import type { Node as ShortcodeNode } from "@/shared/features/shortcode-parser/parser"
import { appNodeTreeSchema } from "@/shared/features/serializers/schema"

export function serializeAppStateAsShortcode(componentTree: ReadonlyArray<AppNode>): string {
  return ShortcodeParser.stringify([...componentTree] as ShortcodeNode[])
}

export function deserializeAppStateFromShortcode(input: string): ReadonlyArray<AppNode> {
  return appNodeTreeSchema.parse(ShortcodeParser.parse(input) as unknown)
}
