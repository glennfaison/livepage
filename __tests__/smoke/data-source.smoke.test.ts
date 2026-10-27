import { dataSourceIdList, getDataSourceInfo, loadBrowserDataSource, encodeDataSourceSettings, decodeDataSourceSettings, dataSourceCache } from "@/client/features/data-sources"

/**
 * Smoke: the data-source critical path. Every registered source resolves, and
 * generated-data and rest-api settings round-trip and load through the browser loader.
 */
describe("smoke: data sources", () => {
  beforeEach(() => dataSourceCache.clear())

  it("resolves every registered data source id", () => {
    for (const id of dataSourceIdList) {
      expect(getDataSourceInfo(id)?.id).toBe(id)
    }
  })

  it("round-trips encoded settings", () => {
    const input = { id: "generated-data", settings: { generate: "return 1" } } as never
    expect(decodeDataSourceSettings(encodeDataSourceSettings(input))).toEqual(input)
  })

  it("loads generated data", async () => {
    const result = await loadBrowserDataSource({ id: "generated-data", settings: { generate: "return { ok: true }" } } as never, jest.fn() as unknown as typeof fetch)
    expect(result).toEqual({ ok: true })
  })

  it("loads rest-api data through the fetcher and parses it", async () => {
    const fetcher = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ items: [1, 2] }) })) as unknown as typeof fetch
    const result = await loadBrowserDataSource(
      { id: "rest-api", settings: { url: "https://example.test/data", "parse-result": "return data.items" } } as never,
      fetcher,
    )
    expect(result).toEqual([1, 2])
  })

  it("surfaces a failed request instead of caching it", async () => {
    const fetcher = jest.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })) as unknown as typeof fetch
    await expect(
      loadBrowserDataSource({ id: "rest-api", settings: { url: "https://example.test/bad" } } as never, fetcher),
    ).rejects.toThrow("500")
  })
})
