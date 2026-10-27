import { dataSourceCache, dataSourceCacheKey } from "./cache"

describe("dataSourceCache", () => {
  beforeEach(() => {
    dataSourceCache.clear()
    jest.restoreAllMocks()
  })

  describe("dataSourceCacheKey", () => {
    it("builds a deterministic key from data source ID and settings", () => {
      const key1 = dataSourceCacheKey("rest-api", { url: "https://example.com", "parse-result": "return data" })
      const key2 = dataSourceCacheKey("rest-api", { url: "https://example.com", "parse-result": "return data" })
      expect(key1).toBe(key2)
      expect(key1).toBe("rest-api:{\"url\":\"https://example.com\",\"parse-result\":\"return data\"}")
    })

    it("produces different keys for different settings", () => {
      const key1 = dataSourceCacheKey("rest-api", { url: "https://a.com" })
      const key2 = dataSourceCacheKey("rest-api", { url: "https://b.com" })
      expect(key1).not.toBe(key2)
    })
  })

  describe("set and get", () => {
    it("stores and returns a cached result", () => {
      const key = dataSourceCacheKey("rest-api", { url: "https://example.com" })
      dataSourceCache.set(key, { items: [1, 2, 3] })
      const result = dataSourceCache.get(key)
      expect(result).toEqual({ items: [1, 2, 3] })
    })

    it("returns null for a key that was never set", () => {
      expect(dataSourceCache.get(dataSourceCacheKey("rest-api", { url: "https://missing.com" }))).toBeNull()
    })

    it("returns null after invalidation", () => {
      const key = dataSourceCacheKey("rest-api", { url: "https://example.com" })
      dataSourceCache.set(key, { items: [1] })
      expect(dataSourceCache.get(key)).toEqual({ items: [1] })
      dataSourceCache.invalidate(key)
      expect(dataSourceCache.get(key)).toBeNull()
    })
  })

  describe("has", () => {
    it("returns true for a valid cached entry", () => {
      const key = dataSourceCacheKey("rest-api", { url: "https://example.com" })
      dataSourceCache.set(key, { ok: true })
      expect(dataSourceCache.has(key)).toBe(true)
    })

    it("returns false for a missing key", () => {
      expect(dataSourceCache.has(dataSourceCacheKey("rest-api", { url: "https://missing.com" }))).toBe(false)
    })

    it("returns false after invalidation", () => {
      const key = dataSourceCacheKey("rest-api", { url: "https://example.com" })
      dataSourceCache.set(key, { ok: true })
      dataSourceCache.invalidate(key)
      expect(dataSourceCache.has(key)).toBe(false)
    })
  })

  describe("TTL expiry", () => {
    it("expires entries after the TTL", () => {
      const key = dataSourceCacheKey("rest-api", { url: "https://example.com" })
      dataSourceCache.set(key, { ok: true }, 10) // 10 ms TTL
      expect(dataSourceCache.get(key)).toEqual({ ok: true })

      const originalNow = Date.now
      const fakeNow = jest
        .spyOn(Date, "now")
        .mockImplementation(() => originalNow.call(Date) + 20)
      expect(dataSourceCache.get(key)).toBeNull()
      fakeNow.mockRestore()
    })
  })

  describe("clear", () => {
    it("removes all entries", () => {
      dataSourceCache.set(dataSourceCacheKey("a", { x: 1 }), { a: 1 })
      dataSourceCache.set(dataSourceCacheKey("b", { x: 2 }), { b: 2 })
      dataSourceCache.clear()
      expect(dataSourceCache.get(dataSourceCacheKey("a", { x: 1 }))).toBeNull()
      expect(dataSourceCache.get(dataSourceCacheKey("b", { x: 2 }))).toBeNull()
    })
  })
})
