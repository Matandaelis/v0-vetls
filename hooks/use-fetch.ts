"use client"

import { useState, useCallback, useEffect } from "react"

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  autoFetch?: boolean
  refetchInterval?: number
}

export function useFetch<T>(url: string, options: UseFetchOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { onSuccess, onError, autoFetch = true, refetchInterval } = options

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await window.fetch(url)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const result = (await response.json()) as T
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error")
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [url, onSuccess, onError])

  useEffect(() => {
    if (!autoFetch) return
    fetch()

    if (refetchInterval) {
      const interval = setInterval(fetch, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [autoFetch, refetchInterval, fetch])

  return { data, loading, error, refetch: fetch }
}
