import { createApplyComponentTemplateActions } from "./component-actions"
import { callToActionTemplate } from "./definitions/component-templates/call-to-action"
import type { AppAction, AppNode } from "@/client/features/types"

type ReplaceAction = Extract<AppAction, { type: "REPLACE_COMPONENT" }>

function collectIds(node: Readonly<AppNode>, ids: Set<string>): void {
  ids.add(node.attributes.id)
  for (const child of node.children) {
    if (typeof child !== "string") collectIds(child, ids)
  }
}

function asReplaceComponent(action: AppAction): ReplaceAction {
  return action as unknown as ReplaceAction
}

describe("createApplyComponentTemplateActions", () => {
  it("returns a single REPLACE_COMPONENT action", () => {
    const actions = createApplyComponentTemplateActions(callToActionTemplate, { componentId: "existing-id" })
    expect(actions.length).toBe(1)
    expect(actions[0].type).toBe("REPLACE_COMPONENT")
  })

  it("targets the supplied component id", () => {
    const actions = createApplyComponentTemplateActions(callToActionTemplate, { componentId: "existing-id" })
    expect(asReplaceComponent(actions[0]).payload.oldComponentId).toBe("existing-id")
  })

  it("clones the root with fresh ids based on the suffix", () => {
    const actions = createApplyComponentTemplateActions(callToActionTemplate, {
      componentId: "existing-id",
      idSuffix: "-copy",
    })
    const newComponent = asReplaceComponent(actions[0]).payload.newComponent!
    expect(newComponent.tag).toBe("column")
    expect(newComponent.attributes.id).toBe("cta-root-copy")

    const originalIds = new Set<string>()
    collectIds(callToActionTemplate.content.root, originalIds)
    const clonedIds = new Set<string>()
    collectIds(newComponent, clonedIds)

    expect(clonedIds.size).toBe(originalIds.size)
    for (const id of clonedIds) expect(id.endsWith("-copy")).toBe(true)
    expect([...clonedIds].some((id) => originalIds.has(id))).toBe(false)
  })

  it("uses -copy as the default suffix", () => {
    const actions = createApplyComponentTemplateActions(callToActionTemplate, { componentId: "existing-id" })
    const newComponent = asReplaceComponent(actions[0]).payload.newComponent!
    expect(newComponent.attributes.id).toBe("cta-root-copy")
  })
})
