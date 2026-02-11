/**
 * Advanced performance monitoring and metrics collection
 * Tracks API latency, cache hit rates, and resource usage
 */

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

interface AggregatedMetrics {
  count: number
  sum: number
  min: number
  max: number
  avg: number
  p50: number
  p95: number
  p99: number
}

class MetricsCollector {
  private metrics: Map<string, number[]> = new Map()
  private maxSamples = 1000 // Keep last 1000 samples per metric

  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getMetricKey(name, tags)
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }

    const samples = this.metrics.get(key)!
    samples.push(value)

    // Keep only recent samples
    if (samples.length > this.maxSamples) {
      samples.shift()
    }
  }

  getMetrics(name: string, tags?: Record<string, string>): AggregatedMetrics | null {
    const key = this.getMetricKey(name, tags)
    const samples = this.metrics.get(key)

    if (!samples || samples.length === 0) {
      return null
    }

    const sorted = [...samples].sort((a, b) => a - b)
    const count = sorted.length
    const sum = sorted.reduce((acc, val) => acc + val, 0)

    return {
      count,
      sum,
      min: sorted[0],
      max: sorted[count - 1],
      avg: sum / count,
      p50: this.percentile(sorted, 0.5),
      p95: this.percentile(sorted, 0.95),
      p99: this.percentile(sorted, 0.99),
    }
  }

  getAllMetrics(): Record<string, AggregatedMetrics> {
    const result: Record<string, AggregatedMetrics> = {}
    
    for (const key of this.metrics.keys()) {
      const metrics = this.getMetrics(key)
      if (metrics) {
        result[key] = metrics
      }
    }

    return result
  }

  private getMetricKey(name: string, tags?: Record<string, string>): string {
    if (!tags) return name
    const tagStr = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',')
    return `${name}{${tagStr}}`
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1
    return sorted[Math.max(0, index)]
  }

  clear(): void {
    this.metrics.clear()
  }
}

export const metricsCollector = new MetricsCollector()

/**
 * Timer utility for measuring execution time
 */
export class Timer {
  private startTime: number

  constructor() {
    this.startTime = performance.now()
  }

  stop(): number {
    return performance.now() - this.startTime
  }

  stopAndRecord(metricName: string, tags?: Record<string, string>): number {
    const duration = this.stop()
    metricsCollector.recordMetric(metricName, duration, tags)
    return duration
  }
}

/**
 * Decorator for automatic timing of async functions
 */
export function timed(metricName: string, getTags?: (...args: any[]) => Record<string, string>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const timer = new Timer()
      try {
        const result = await originalMethod.apply(this, args)
        const tags = getTags ? getTags(...args) : { method: propertyKey }
        timer.stopAndRecord(metricName, tags)
        return result
      } catch (error) {
        const tags = getTags ? getTags(...args) : { method: propertyKey }
        timer.stopAndRecord(`${metricName}.error`, { ...tags, error: 'true' })
        throw error
      }
    }

    return descriptor
  }
}

/**
 * API latency tracking middleware
 */
export function trackApiLatency(endpoint: string) {
  const timer = new Timer()
  
  return {
    stop: (status: number) => {
      timer.stopAndRecord('api.latency', {
        endpoint,
        status: status.toString(),
      })
    }
  }
}
