"use client"

import type React from "react"
import { createContext, useContext } from "react"
import type { Product } from "@/lib/types"
import { mockProducts } from "@/lib/mock-data"

interface ProductContextType {
  products: Product[]
  getProductById: (id: string) => Product | undefined
  getProductsByCategory: (category: string) => Product[]
  getCategories: () => string[]
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const products = mockProducts

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id)
  }

  const getProductsByCategory = (category: string) => {
    return products.filter((p) => p.category === category)
  }

  const getCategories = () => {
    return Array.from(new Set(products.map((p) => p.category)))
  }

  const value: ProductContextType = {
    products,
    getProductById,
    getProductsByCategory,
    getCategories,
  }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}
