import { z } from "zod"
import { componentMetadataByTag } from "@/client/features/design-components"
import type { AppNode } from "@/client/features/types"

const allowedAppNodeTags = new Set(Object.keys(componentMetadataByTag))

const appNodeTagSchema = z.string().refine((tag) => allowedAppNodeTags.has(tag), {
  message: "Invalid component tag",
})

const appNodeSchema: z.ZodType<AppNode> = z.lazy(() =>
  z
    .object({
      tag: appNodeTagSchema,
      attributes: z.record(z.string(), z.string()),
      children: z.array(z.union([appNodeSchema, z.string()])),
    })
    .strict(),
)

export const appNodeTreeSchema = z.array(appNodeSchema)
