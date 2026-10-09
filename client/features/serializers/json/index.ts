import type { AppNode } from "@/client/features/types"
import { appNodeTreeSchema } from "@/client/features/serializers/schema"
import { validateAndFixDuplicateIds } from "@/client/features/serializers/id-validation"
import { toast } from "@/client/components/ui/use-toast"

/**
 * Serializes the app state (component tree) as a pretty-printed JSON string.
 *
 * @param componentTree - The array of page components to serialize
 * @returns JSON string representation of the component tree
 */
export function serializeAppStateAsJson(componentTree: ReadonlyArray<AppNode>): string {
  return JSON.stringify(componentTree, null, 2)
}

/**
 * Deserializes a JSON string back into a component tree, validating against
 * the schema and fixing any duplicate component IDs.
 *
 * @param input - JSON string to deserialize
 * @returns Validated component tree with unique IDs
 */
export function deserializeAppStateFromJson(input: string): ReadonlyArray<AppNode> {
  const parsed = appNodeTreeSchema.parse(JSON.parse(input))
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
