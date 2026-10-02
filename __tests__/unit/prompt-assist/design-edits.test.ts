import type { AppNode } from "@/client/features/app-state"
import { applyDesignEdits, describePage, validateDesignEdits, type DesignEdit } from "@/client/features/prompt-assist"
import { filterDesignEdits } from "@/shared/features/prompt-assist"

const pages: ReadonlyArray<AppNode> = [
  {
    tag: "page",
    attributes: { id: "p1", title: "Home" },
    children: [
      { tag: "callout", attributes: { id: "c1", tone: "neutral" }, children: ["Hello"] },
      { tag: "link", attributes: { id: "l1", href: "#a" }, children: ["Go"] },
      { tag: "column", attributes: { id: "col1", gap: "1rem" }, children: [] },
    ],
  },
]

const edit = (componentId: string, setting: string, value: string): DesignEdit => ({ componentId, setting, value, reason: "test" })

describe("validateDesignEdits", () => {
  it("accepts a select value from the component's own options", () => {
    expect(validateDesignEdits(pages, [edit("c1", "tone", "warning")])).toEqual([edit("c1", "tone", "warning")])
  })

  it.each([
    ["an unknown component", edit("nope", "tone", "info")],
    ["an unknown setting", edit("c1", "bogus", "x")],
    ["a select value outside the options", edit("c1", "tone", "purple-haze")],
    ["a setting stored outside attributes (content)", edit("c1", "content", "hacked")],
    ["the id", edit("c1", "id", "other")],
    ["a value equal to the current one", edit("c1", "tone", "neutral")],
  ])("drops %s", (_label, candidate) => {
    expect(validateDesignEdits(pages, [candidate])).toEqual([])
  })

  it.each(["javascript:alert(1)", "  JavaScript:alert(1)", "data:text/html,<script>1</script>", "vbscript:x"])(
    "refuses the executable URL %p on a free-text setting",
    (value) => {
      expect(validateDesignEdits(pages, [edit("l1", "href", value)])).toEqual([])
    },
  )

  it("allows ordinary URLs, anchors and mailto links", () => {
    for (const value of ["https://example.com", "#contact", "mailto:a@b.co"]) {
      expect(validateDesignEdits(pages, [edit("l1", "href", value)])).toHaveLength(1)
    }
  })

  it("lets the last edit to a setting win and keeps output order stable", () => {
    const result = validateDesignEdits(pages, [edit("c1", "tone", "info"), edit("l1", "href", "#b"), edit("c1", "tone", "success")])
    expect(result.map((e) => [e.componentId, e.value])).toEqual([["c1", "success"], ["l1", "#b"]])
  })

  it("drops an edit that a later edit reverts to the original", () => {
    expect(validateDesignEdits(pages, [edit("c1", "tone", "info"), edit("c1", "tone", "neutral")])).toEqual([])
  })
})

describe("applyDesignEdits", () => {
  it("writes validated edits as attributes on a copy and leaves the input untouched", () => {
    const before = JSON.stringify(pages)
    const next = applyDesignEdits(pages, [edit("c1", "tone", "warning"), edit("c1", "tone", "not-an-option")])
    expect(JSON.stringify(pages)).toBe(before)
    expect(JSON.stringify(next)).toContain('"tone":"warning"')
    expect(JSON.stringify(next)).toContain("Hello")
  })
})

describe("server/client validation parity", () => {
  it("accepts and rejects the same edits whether checked against a page description or the live registry", () => {
    const description = describePage(pages)
    const resolve = (candidate: DesignEdit) => {
      const node = description.nodes.find((entry) => entry.id === candidate.componentId)
      const setting = node ? description.settings[node.tag]?.find((entry) => entry.id === candidate.setting) : undefined
      return node && setting ? { setting, current: node.settings[candidate.setting] ?? "" } : null
    }
    const edits = [
      edit("c1", "tone", "info"),
      edit("c1", "tone", "bad"),
      edit("c1", "content", "x"),
      edit("l1", "href", "javascript:1"),
      edit("l1", "href", "#b"),
      edit("ghost", "tone", "info"),
      edit("col1", "gap", "1rem"),
    ]
    expect(filterDesignEdits(edits, resolve)).toEqual(validateDesignEdits(pages, edits))
    expect(validateDesignEdits(pages, edits).map((e) => e.value)).toEqual(["info", "#b"])
  })
})
