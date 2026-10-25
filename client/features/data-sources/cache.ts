/**
 * In-memory cache for data source results with TTL.
 *
 * Keyed by data source ID + settings, storing result, timestamp, and TTL.
 * Default TTL is 5 minutes. Errors are never cached.
 */

export type CacheEntry = {
  result: unknown
  timestamp: number
  ttl: number
}

/** Build a cache key from a data source ID and its settings object. */
export function dataSourceCacheKey(
  dataSourceId: string,
  settings: Readonly<Record<string, unknown>>,
): string {
  return `${dataSourceId}:${JSON.stringify(settings)}`
}

export class DataSourceCache {
  private readonly cache = new Map<string, CacheEntry>()
  private readonly defaultTtlMs: number

  constructor(defaultTtlMs = 5 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs
  }

  /**
   * Returns the cached result if present and not expired, otherwise null.
   * Expired entries are evicted on read.
   */
  get(key: string): unknown | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    const age = Date.now() - entry.timestamp
    if (age > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    return entry.result
  }

  /**
   * Stores a result under key with the given TTL (defaults to 5 minutes).
   * Callers must not pass errors here; errors are never cached.
   */
  set(key: string, result: unknown, ttlMs?: number): void {
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      ttl: ttlMs ?? this.defaultTtlMs,
    })
  }

  /** True when a valid (non-expired) entry exists for key. */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /** Removes the entry for key, if any. */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /** Removes all entries. */
  clear(): void {
    this.cache.clear()
  }
}

export const dataSourceCache = new DataSourceCache()
