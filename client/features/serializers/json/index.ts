import type { AppNode } from "@/client/features/types"
import { appNodeTreeSchema } from "@/client/features/serializers/schema"

export function serializeAppStateAsJson(componentTree: ReadonlyArray<AppNode>): string {
  return JSON.stringify(componentTree, null, 2)
}

export function deserializeAppStateFromJson(input: string): ReadonlyArray<AppNode> {
  return appNodeTreeSchema.parse(JSON.parse(input))
}
