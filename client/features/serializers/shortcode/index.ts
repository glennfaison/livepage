import type { AppNode } from "@/client/features/types"
import { parse, stringify, type Node as ShortcodeNode } from "@/client/features/shortcode-parser"
import { appNodeTreeSchema } from "@/client/features/serializers/schema"

export function serializeAppStateAsShortcode(componentTree: ReadonlyArray<AppNode>): string {
  return stringify([...componentTree] as ShortcodeNode[])
}

export function deserializeAppStateFromShortcode(input: string): ReadonlyArray<AppNode> {
  return appNodeTreeSchema.parse(parse(input) as unknown)
}
