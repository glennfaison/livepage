import type { AppNode } from "@/client/features/app-state"
import { refinePage, MAX_REFINE_STEPS, type DesignEdit } from "@/client/features/prompt-assist"

const pages: ReadonlyArray<AppNode> = [
  { tag: "page", attributes: { id: "p" }, children: [{ tag: "callout", attributes: { id: "c", tone: "neutral" }, children: ["Hi"] }] },
]
const setTone = (value: string): DesignEdit => ({ componentId: "c", setting: "tone", value, reason: "r" })
const step = (edits: DesignEdit[], done = false, satisfaction: number | null = null) => ({ satisfaction, done, edits })

describe("refinePage", () => {
  it("applies each step's edits before asking for the next, until a step says done", async () => {
    const seenTones: string[] = []
    const requestStep = jest.fn(async (current: ReadonlyArray<AppNode>) => {
      seenTones.push(JSON.stringify(current).match(/"tone":"(\w+)"/)?.[1] ?? "")
      return seenTones.length === 1 ? step([setTone("info")], false, 0.3) : step([setTone("success")], true, 0.9)
    })
    const result = await refinePage({ pages, requestStep })

    expect(seenTones).toEqual(["neutral", "info"])
    expect(result.edits.map((edit) => edit.value)).toEqual(["success"])
    expect(result.satisfaction).toBe(0.9)
  })

  it("stops when a step proposes nothing that changes the page", async () => {
    const requestStep = jest.fn(async () => step([setTone("neutral"), { ...setTone("x"), setting: "bogus" }]))
    const result = await refinePage({ pages, requestStep })
    expect(requestStep).toHaveBeenCalledTimes(1)
    expect(result.edits).toEqual([])
  })

  it("is bounded, so a provider that never says done cannot loop forever", async () => {
    let flip = false
    const requestStep = jest.fn(async () => step([setTone((flip = !flip) ? "info" : "success")]))
    await refinePage({ pages, requestStep })
    expect(requestStep).toHaveBeenCalledTimes(MAX_REFINE_STEPS)
  })

  it("reports progress and drops settings that ended where they began", async () => {
    const onStep = jest.fn()
    const responses = [step([setTone("info")]), step([setTone("neutral")], true)]
    const result = await refinePage({ pages, requestStep: async () => responses.shift()!, onStep })
    expect(onStep.mock.calls).toEqual([[1], [2]])
    expect(result.edits).toEqual([])
  })

  it("propagates a failed step so the caller can report it", async () => {
    await expect(refinePage({ pages, requestStep: async () => { throw new Error("boom") } })).rejects.toThrow("boom")
  })
})
