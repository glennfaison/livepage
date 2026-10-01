import type { AppNode } from "@/shared/features/types"
import { appNodeTreeSchema } from "@/shared/features/serializers/schema"

export function serializeAppStateAsJson(componentTree: ReadonlyArray<AppNode>): string {
  return JSON.stringify(componentTree, null, 2)
}

export function deserializeAppStateFromJson(input: string): ReadonlyArray<AppNode> {
  return appNodeTreeSchema.parse(JSON.parse(input))
}
