"use client"

import { useState, useCallback } from "react"
import type { Product } from "../lib/types"

interface PinnedProductState {
  pinnedProduct: Product | null
  isPinned: boolean
  pinProduct: (product: Product) => void
  unpinProduct: () => void
  togglePin: (product: Product) => void
}

export function usePinnedProduct(initialProduct: Product | null = null): PinnedProductState {
  const [pinnedProduct, setPinnedProduct] = useState<Product | null>(initialProduct)

  const pinProduct = useCallback((product: Product) => {
    setPinnedProduct(product)
  }, [])

  const unpinProduct = useCallback(() => {
    setPinnedProduct(null)
  }, [])

  const togglePin = useCallback((product: Product) => {
    setPinnedProduct(prev => prev?.id === product.id ? null : product)
  }, [])

  return {
    pinnedProduct,
    isPinned: pinnedProduct !== null,
    pinProduct,
    unpinProduct,
    togglePin,
  }
}