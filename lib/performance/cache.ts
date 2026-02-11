/**
 * Performance-optimized caching layer with TTL and invalidation strategies
 * Supports in-memory caching with automatic cleanup
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class PerformanceCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Auto-cleanup stale entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  set<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

export const performanceCache = new PerformanceCache()

/**
 * Decorator for caching function results
 */
export function cached<T>(
  keyGenerator: (...args: any[]) => string,
  ttl: number = 300000
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyGenerator(...args)
      const cached = performanceCache.get<T>(cacheKey)

      if (cached !== null) {
        return cached
      }

      const result = await originalMethod.apply(this, args)
      performanceCache.set(cacheKey, result, ttl)
      return result
    }

    return descriptor
  }
}
