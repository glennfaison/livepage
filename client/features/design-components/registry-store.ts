// Dependency-free component lookup. This module holds no static imports of
// `definitions/*`, so decorators and editor controls under this feature can
// resolve component metadata by tag without creating an import cycle through
// `registry.ts` (which is the only module that imports every definition to
// populate this store).
import type { AppNodeTag, Props, Metadata, AppNode } from "@/client/features/types"

const mutableComponentMetadataByTag: Record<string, Metadata> = {}
export const componentMetadataByTag: Readonly<Record<string, Metadata>> = mutableComponentMetadataByTag

export function registerComponent(metadata: Metadata): void {
  mutableComponentMetadataByTag[metadata.tag] = metadata
}

export function getComponentsAllowedIn(parentTag?: AppNodeTag): ReadonlyArray<Metadata> {
  const parentMetadata = parentTag ? componentMetadataByTag[parentTag] : undefined
  if (!parentMetadata?.acceptsChildren) return []

  return Object.values(componentMetadataByTag).filter((childMetadata) => {
    if (parentMetadata.allowedChildTags && !parentMetadata.allowedChildTags.includes(childMetadata.tag)) return false
    return childMetadata.allowedParentTags === undefined ||
      (parentTag !== undefined && childMetadata.allowedParentTags.includes(parentTag))
  })
}

function getDefaultAttributes(metadata: Metadata): Readonly<Record<string, unknown>> {
  const defaults: Record<string, unknown> = {}
  const collectDefaults = (attributes: ReadonlyArray<Metadata["attributes"][number]>) => {
    for (const attribute of attributes) {
      if (attribute.type === "group") {
        collectDefaults(attribute.fields)
      } else if (attribute.type !== "divider" && attribute.id !== "content") {
        defaults[attribute.id] = attribute.defaultValue
      }
    }
  }
  collectDefaults(metadata.attributes)
  return defaults
}

export const getComponentInfo = function (tag: string): Metadata {
  const metadata = componentMetadataByTag[tag]
  if (!metadata) throw new Error(`Unknown component tag: ${tag}`)
  return {
    ...metadata,
    keywords: [...metadata.keywords],
    defaultChildren: [...metadata.defaultChildren],
    defaultAttributes: getDefaultAttributes(metadata),
    attributes: metadata.attributes.map(attr =>
      attr.type === "group"
        ? { ...attr, fields: attr.fields.map(field => ({ ...field })) }
        : { ...attr },
    ),
  }
}

export function createDesignComponentInstance(
  tag: string,
  id: string,
  overrideProps?: Props["component"]["attributes"],
): Readonly<AppNode> {
  const metadata = getComponentInfo(tag)
  return {
    tag,
    attributes: { ...(metadata.defaultAttributes || {}), ...overrideProps, id: `${tag}-${id}` },
    children: [...metadata.defaultChildren],
  }
}
