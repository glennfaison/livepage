import type { AppNode } from "@/client/features/types"
import { parse, stringify, type Node as ShortcodeNode } from "@/client/features/shortcode-parser"
import { appNodeTreeSchema } from "@/client/features/serializers/schema"
import { validateAndFixDuplicateIds } from "@/client/features/serializers/id-validation"
import { toast } from "@/client/components/ui/use-toast"

export function serializeAppStateAsShortcode(componentTree: ReadonlyArray<AppNode>): string {
  return stringify([...componentTree] as ShortcodeNode[])
}

export function deserializeAppStateFromShortcode(input: string): ReadonlyArray<AppNode> {
  const parsed = appNodeTreeSchema.parse(parse(input) as unknown)
  const { duplicateCount, fixedIds } = validateAndFixDuplicateIds(parsed)

  if (duplicateCount > 0) {
    toast({
      title: "Duplicate component IDs fixed",
      description: `${duplicateCount} duplicate component ID${duplicateCount > 1 ? "s" : ""} were automatically regenerated.`,
      variant: "default",
    })
    console.warn(
      `[LivePage Import] Fixed ${duplicateCount} duplicate component ID(s):`,
      fixedIds.map(({ oldId, newId }) => `${oldId} → ${newId}`).join(", ")
    )
  }

  return parsed
}
