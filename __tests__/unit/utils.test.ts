import { cn, generateId, intersperseAndAppend } from "@/lib/utils"

describe("Utility Functions", () => {
  describe("cn function", () => {
    it("should merge class names correctly", () => {
      const result = cn("class1", "class2", { class3: true, class4: false })
      expect(result).toContain("class1")
      expect(result).toContain("class2")
      expect(result).toContain("class3")
      expect(result).not.toContain("class4")
    })
  })

  describe("generateId function", () => {
    it("should generate a string ID", () => {
      const id = generateId()
      expect(typeof id).toBe("string")
      expect(id.length).toBeGreaterThan(0)
    })

    it("should generate unique IDs", () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe("intersperseAndAppend function", () => {
    it("should return empty array when input is empty", () => {
      const result = intersperseAndAppend([], "divider")
      expect(result).toEqual([])
    })

    it("should intersperse items correctly", () => {
      const result = intersperseAndAppend(["a", "b", "c"], "divider")
      expect(result).toEqual(["divider", "a", "divider", "b", "divider", "c", "divider"])
    })

    it("should work with single item", () => {
      const result = intersperseAndAppend(["a"], "divider")
      expect(result).toEqual(["divider", "a", "divider"])
    })
  })
})
