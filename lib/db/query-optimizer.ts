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
        if (queries.length === 0) continue

        // Analyze and group queries by structure to identify bulk optimization opportunities
        const analysis = queries.map(q => ({
          query: q,
          calls: this.analyzeQuery(q.query)
        }))

        const processed = new Set<number>()
        const finalResults = new Array(queries.length)
        let optimizedBatches = 0

        for (let i = 0; i < queries.length; i++) {
          if (processed.has(i)) continue

          const optimizableMatch = this.findOptimizableBatch(i, analysis, processed)

          if (optimizableMatch) {
            // Execute as a single bulk operation (e.g., using .in() for multiple .eq() calls)
            const { results, indices } = await this.executeBulkQuery(supabase, optimizableMatch)
            indices.forEach((originalIdx, resultIdx) => {
              finalResults[originalIdx] = results[resultIdx]
              processed.add(originalIdx)
            })
            optimizedBatches++
          } else {
            // Fallback: Execute single query if no optimization match found
            const current = analysis[i]
            const { query, table } = current.query
            const { data, error } = await query(supabase.from(table))
            if (error) throw error
            finalResults[i] = data
            processed.add(i)
          }
        }

        // Resolve all original promises with their corresponding results
        queries.forEach((q, index) => {
          q.resolve(finalResults[index])
        })

        metricsCollector.recordMetric('db.batch.size', queries.length, { batchKey })
        metricsCollector.recordMetric('db.batch.optimized_count', optimizedBatches, { batchKey })
      } catch (error) {
        queries.forEach(q => q.reject(error))
      }
    }
  }

  /**
   * Dry-run a query builder using a Proxy to record its structure
   */
  private analyzeQuery(queryBuilder: (query: any) => any) {
    const calls: { method: string, args: any[] }[] = []
    const recorder = new Proxy({} as any, {
      get: (target, prop) => {
        if (prop === 'then' || typeof prop === 'symbol') return undefined
        return (...args: any[]) => {
          calls.push({ method: prop as string, args })
          return recorder
        }
      }
    })

    try {
      queryBuilder(recorder)
      return calls
    } catch (e) {
      // If query builder logic is too complex for Proxy, return null to skip optimization
      return null
    }
  }

  /**
   * Find a group of queries that can be merged into a single operation
   */
  private findOptimizableBatch(startIndex: number, analysis: any[], processed: Set<number>) {
    const current = analysis[startIndex]
    if (!current.calls) return null

    // Pattern: .select().eq(column, value)
    const isSimpleSelectEq = current.calls.length === 2 &&
      current.calls[0].method === 'select' &&
      current.calls[1].method === 'eq'

    if (!isSimpleSelectEq) return null

    const table = current.query.table
    const selectArgs = current.calls[0].args
    const column = current.calls[1].args[0]

    // Only optimize if the filter column is present in select results (for mapping back)
    const isColumnInSelect = selectArgs[0] === '*' ||
      (typeof selectArgs[0] === 'string' && selectArgs[0].includes(column))

    if (!isColumnInSelect) return null

    const batchIndices = [startIndex]
    const values = [current.calls[1].args[1]]

    // Look for other queries with the same structure but different values
    for (let j = startIndex + 1; j < analysis.length; j++) {
      if (processed.has(j)) continue
      const other = analysis[j]

      const isMatch = other.calls?.length === 2 &&
        other.query.table === table &&
        other.calls[0].method === 'select' &&
        JSON.stringify(other.calls[0].args) === JSON.stringify(selectArgs) &&
        other.calls[1].method === 'eq' &&
        other.calls[1].args[0] === column

      if (isMatch) {
        batchIndices.push(j)
        values.push(other.calls[1].args[1])
      }
    }

    // Only "bulk" if we have at least 2 queries to merge
    return batchIndices.length >= 2 ? { table, selectArgs, column, values, indices: batchIndices } : null
  }

  /**
   * Execute a merged bulk query and return results mapped to original query indices
   */
  private async executeBulkQuery(supabase: SupabaseClient, batch: any) {
    const { table, selectArgs, column, values, indices } = batch

    // Use .in() to fetch all requested values in a single round-trip
    const { data, error } = await supabase
      .from(table)
      .select(selectArgs[0], selectArgs[1])
      .in(column, values)

    if (error) throw error

    // Map the combined results back to each original query's requested value
    const results = values.map((val: any) => {
      return (data as any[]).filter(item => item[column] === val)
    })

    return { results, indices }
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
