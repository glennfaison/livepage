import { deepClone } from "@/client/lib/deep-clone"

describe("deepClone", () => {
  it("produces a deep copy of a plain object", () => {
    const original = { a: 1, b: { c: 2 } }
    const clone = deepClone(original)

    expect(clone).toEqual(original)
    expect(clone).not.toBe(original)
    expect(clone.b).not.toBe(original.b)
  })

  it("deep-copies through the JSON fallback when structuredClone is unavailable", () => {
    if (typeof structuredClone !== "undefined") return
    const original = { a: 1, b: { c: 2 } }
    const clone = deepClone(original)

    expect(clone).toEqual(original)
    expect(clone).not.toBe(original)
    expect(clone.b).not.toBe(original.b)
  })

  it("preserves a Date through the clone when structuredClone is available", () => {
    if (typeof structuredClone === "undefined") return
    const original = { when: new Date("2026-01-02T03:04:05Z") }
    const clone = deepClone(original)

    expect(clone.when).toBeInstanceOf(Date)
    expect(clone.when.getTime()).toBe(original.when.getTime())
    expect(clone.when).not.toBe(original.when)
  })

  it("preserves a Map through the clone when structuredClone is available", () => {
    if (typeof structuredClone === "undefined") return
    const original = { entries: new Map([["key", "value"]]) }
    const clone = deepClone(original)

    expect(clone.entries).toBeInstanceOf(Map)
    expect(clone.entries.get("key")).toBe("value")
    expect(clone.entries).not.toBe(original.entries)
  })
})
