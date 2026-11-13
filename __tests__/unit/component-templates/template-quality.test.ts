import { existsSync } from "node:fs"
import path from "node:path"
import { componentTemplateRegistry } from "@/client/features/component-templates"
import { componentMetadataByTag } from "@/client/features/design-components"
import type { TemplateNode } from "@/client/features/templates/template-helpers"

const publicDir = path.join(process.cwd(), "public")

function collectIds(node: Readonly<TemplateNode>, ids: string[]): void {
  ids.push(node.attributes.id)
  for (const child of node.children) {
    if (typeof child !== "string") collectIds(child, ids)
  }
}

describe.each(componentTemplateRegistry.map((template) => [template.id, template] as const))("component template quality: %s", (_id, template) => {
  const root = template.content.root[0]

  it("uses unique component ids", () => {
    const ids: string[] = []
    collectIds(root, ids)
    expect(ids.filter((id) => !id)).toEqual([])
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([])
  })

  it("has a root tag that is allowed as a child of some registered component", () => {
    const rootTag = root.tag
    const metadata = componentMetadataByTag[rootTag]
    expect(metadata).toBeDefined()
    if (!metadata) return

    // The root tag must not restrict which parents it can go under (undefined allowedParentTags),
    // or must be listed as an allowed child of at least one component that accepts children.
    const allowedParents = metadata.allowedParentTags
    if (allowedParents === undefined) {
      // Can go under any parent that accepts children
      expect(true).toBe(true)
      return
    }
    const canBeChildOfSomeParent = Object.values(componentMetadataByTag).some(
      (parent) => parent.acceptsChildren && parent.allowedChildTags?.includes(rootTag),
    )
    expect(canBeChildOfSomeParent).toBe(true)
  })

  it("has a thumbnail asset that exists", () => {
    const thumbnail = template.metadata.thumbnail
    expect(thumbnail.startsWith("/")).toBe(true)
    expect(existsSync(path.join(publicDir, thumbnail))).toBe(true)
  })
})
