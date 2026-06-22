import { z } from "zod"
import { componentTagList } from "@/features/design-components"
import type { AppNode } from "@/features/app-state"

const allowedAppNodeTags = new Set([...componentTagList, "page"])

const appNodeTagSchema = z.string().refine((tag) => allowedAppNodeTags.has(tag), {
  message: "Invalid component tag",
})

export const appNodeSchema: z.ZodType<AppNode> = z.lazy(() =>
  z
    .object({
      tag: appNodeTagSchema,
      attributes: z.record(z.string(), z.string()),
      children: z.array(z.union([appNodeSchema, z.string()])),
    })
    .strict(),
)

export const appNodeTreeSchema = z.array(appNodeSchema)
