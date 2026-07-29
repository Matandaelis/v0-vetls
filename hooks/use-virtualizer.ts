"use client"

import { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from "react"

interface UseVirtualizerOptions {
  count: number
  getScrollElement: () => HTMLElement | null
  estimateSize: (index: number) => number
  overscan?: number
}

interface VirtualItem {
  index: number
  start: number
  size: number
  end: number
}

export function useVirtualizer({
  count,
  getScrollElement,
  estimateSize,
  overscan = 5,
}: UseVirtualizerOptions) {
  const [measuredCache, setMeasuredCache] = useState<Record<number, number>>({})
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const scrollElementRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)

  // Initialize observer
  useLayoutEffect(() => {
    observerRef.current = new ResizeObserver((entries) => {
      setMeasuredCache((prev) => {
        const next = { ...prev }
        let changed = false

        entries.forEach((entry) => {
          const indexAttr = entry.target.getAttribute("data-index")
          if (!indexAttr) return

          const index = parseInt(indexAttr, 10)
          if (isNaN(index)) return

          const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height

          if (next[index] !== height) {
            next[index] = height
            changed = true
          }
        })

        return changed ? next : prev
      })
    })

    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [])

  // Handle Scroll and Resize of container
  useEffect(() => {
    const element = getScrollElement()
    if (!element) return

    scrollElementRef.current = element

    const handleScroll = () => {
      setScrollTop(element.scrollTop)
    }

    const handleResize = () => {
      setContainerHeight(element.clientHeight)
    }

    // Initial values
    setContainerHeight(element.clientHeight)
    setScrollTop(element.scrollTop)

    element.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize)

    return () => {
      element.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [getScrollElement])

  // Calculate items and total size
  const { virtualItems, totalSize } = useMemo(() => {
    const itemOffsets: number[] = []
    let currentOffset = 0

    for (let i = 0; i < count; i++) {
      itemOffsets[i] = currentOffset
      const size = measuredCache[i] ?? estimateSize(i)
      currentOffset += size
    }

    const totalSize = currentOffset

    // Find start index
    let startIndex = 0
    while (startIndex < count && itemOffsets[startIndex + 1] <= scrollTop) {
      startIndex++
    }

    let endIndex = startIndex
    while (
      endIndex < count &&
      itemOffsets[endIndex] < scrollTop + containerHeight
    ) {
      endIndex++
    }

    // Apply overscan
    startIndex = Math.max(0, startIndex - overscan)
    endIndex = Math.min(count - 1, endIndex + overscan)

    const items: VirtualItem[] = []
    for (let i = startIndex; i <= endIndex; i++) {
      const size = measuredCache[i] ?? estimateSize(i)
      items.push({
        index: i,
        start: itemOffsets[i],
        size,
        end: itemOffsets[i] + size
      })
    }

    return { virtualItems: items, totalSize }
  }, [count, measuredCache, estimateSize, scrollTop, containerHeight, overscan])

  const observeElement = useCallback((el: HTMLElement) => {
    if (!el || !observerRef.current) return () => {}

    observerRef.current.observe(el)

    return () => {
      observerRef.current?.unobserve(el)
    }
  }, [])

  const scrollToIndex = useCallback((index: number, align: "start" | "end" | "auto" = "auto") => {
    const element = scrollElementRef.current
    if (!element) return

    // Calculate offset dynamically to ensure latest values
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += measuredCache[i] ?? estimateSize(i)
    }

    const itemSize = measuredCache[index] ?? estimateSize(index)
    const itemEnd = offset + itemSize

    if (align === "end") {
        element.scrollTop = itemEnd - element.clientHeight
    } else if (align === "start") {
        element.scrollTop = offset
    } else {
        // Auto
        if (offset < element.scrollTop) {
            element.scrollTop = offset
        } else if (itemEnd > element.scrollTop + element.clientHeight) {
             element.scrollTop = itemEnd - element.clientHeight
        }
    }
  }, [measuredCache, estimateSize])

  return {
    virtualItems,
    totalSize,
    observeElement,
    scrollToIndex,
  }
}
