/**
 * Database query optimization utilities
 * Provides query batching, connection pooling hints, and index recommendations
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { performanceCache } from '../performance/cache'
import { Timer, metricsCollector } from '../performance/metrics'

interface QueryOptions {
  cache?: boolean
  cacheTTL?: number
  timeout?: number
  batchKey?: string
}

interface BatchedQuery {
  table: string
  query: any
  resolve: (value: any) => void
  reject: (error: any) => void
}

class QueryOptimizer {
  private batchQueue: Map<string, BatchedQuery[]> = new Map()
  private batchTimeout: NodeJS.Timeout | null = null
  private readonly BATCH_DELAY = 10 // ms

  /**
   * Execute optimized query with caching and metrics
   */
  async executeQuery<T>(
    supabase: SupabaseClient,
    table: string,
    queryBuilder: (query: any) => any,
    options: QueryOptions = {}
  ): Promise<T> {
    const timer = new Timer()
    const cacheKey = options.cache ? this.generateCacheKey(table, queryBuilder) : null

    // Check cache
    if (cacheKey && options.cache) {
      const cached = performanceCache.get<T>(cacheKey)
      if (cached) {
        metricsCollector.recordMetric('db.cache.hit', 1, { table })
        return cached
      }
      metricsCollector.recordMetric('db.cache.miss', 1, { table })
    }

    try {
      // Execute query
      const query = supabase.from(table)
      const { data, error } = await queryBuilder(query)

      if (error) throw error

      // Cache result
      if (cacheKey && options.cache) {
        performanceCache.set(cacheKey, data, options.cacheTTL || 300000)
      }

      // Record metrics
      timer.stopAndRecord('db.query.latency', { table, cached: 'false' })
      
      return data as T
    } catch (error) {
      timer.stopAndRecord('db.query.error', { table })
      throw error
    }
  }

  /**
   * Batch multiple queries to the same table
   */
  async batchQuery<T>(
    supabase: SupabaseClient,
    table: string,
    queryBuilder: (query: any) => any,
    batchKey: string = 'default'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const fullBatchKey = `${table}:${batchKey}`
      
      if (!this.batchQueue.has(fullBatchKey)) {
        this.batchQueue.set(fullBatchKey, [])
      }

      this.batchQueue.get(fullBatchKey)!.push({
        table,
        query: queryBuilder,
        resolve,
        reject,
      })

      // Schedule batch execution
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => {
          this.executeBatch(supabase)
        }, this.BATCH_DELAY)
      }
    })
  }

  private async executeBatch(supabase: SupabaseClient) {
    const batches = new Map(this.batchQueue)
    this.batchQueue.clear()
    this.batchTimeout = null

    for (const [batchKey, queries] of batches) {
      try {
        // Execute queries concurrently within batch
        const results = await Promise.all(
          queries.map(async ({ query, table }) => {
            const q = supabase.from(table)
            const { data, error } = await query(q)
            if (error) throw error
            return data
          })
        )

        // Resolve all promises
        queries.forEach((q, index) => {
          q.resolve(results[index])
        })

        metricsCollector.recordMetric('db.batch.size', queries.length, { 
          batchKey 
        })
      } catch (error) {
        queries.forEach(q => q.reject(error))
      }
    }
  }

  /**
   * Invalidate cache for specific table patterns
   */
  invalidateCache(table: string, pattern?: string) {
    if (pattern) {
      performanceCache.invalidatePattern(`${table}:${pattern}`)
    } else {
      performanceCache.invalidatePattern(`${table}:`)
    }
  }

  private generateCacheKey(table: string, queryBuilder: any): string {
    // Simple cache key generation based on table and query structure
    const queryStr = queryBuilder.toString()
    const hash = this.simpleHash(queryStr)
    return `${table}:${hash}`
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }
}

export const queryOptimizer = new QueryOptimizer()

/**
 * Optimized queries for common operations
 */
export class OptimizedQueries {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get shows with optimized joins and caching
   */
  async getShowsWithProducts(status?: string) {
    return queryOptimizer.executeQuery(
      this.supabase,
      'shows',
      (query) => query
        .select(`
          *,
          profiles:host_id (
            id,
            full_name,
            avatar_url
          ),
          show_products (
            product_id,
            products (
              id,
              name,
              price,
              image_url
            )
          )
        `)
        .eq('status', status || 'live')
        .order('start_time', { ascending: false })
        .limit(50),
      { cache: true, cacheTTL: 60000 } // 1 minute cache
    )
  }

  /**
   * Get user with related data using single query
   */
  async getUserProfile(userId: string) {
    return queryOptimizer.executeQuery(
      this.supabase,
      'profiles',
      (query) => query
        .select(`
          *,
          user_points (
            total_points,
            loyalty_tier
          ),
          user_follows_count:user_follows!follower_id (count),
          followers_count:user_follows!following_id (count)
        `)
        .eq('id', userId)
        .single(),
      { cache: true, cacheTTL: 300000 } // 5 minutes
    )
  }

  /**
   * Get products with seller info and categories
   */
  async getProductsWithDetails(filters?: any) {
    return queryOptimizer.executeQuery(
      this.supabase,
      'products',
      (query) => {
        let q = query.select(`
          *,
          profiles:seller_id (
            id,
            full_name,
            avatar_url
          ),
          categories (
            id,
            name
          )
        `)

        if (filters?.category) {
          q = q.eq('category_id', filters.category)
        }
        if (filters?.minPrice) {
          q = q.gte('price', filters.minPrice)
        }
        if (filters?.maxPrice) {
          q = q.lte('price', filters.maxPrice)
        }

        return q.order('created_at', { ascending: false }).limit(50)
      },
      { cache: true, cacheTTL: 120000 } // 2 minutes
    )
  }
}
