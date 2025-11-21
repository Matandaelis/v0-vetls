"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { Product } from "@/lib/types"
import { mockProducts } from "@/lib/mock-data"

interface ProductContextType {
  products: Product[]
  getProductById: (id: string) => Product | undefined
  getProductsByCategory: (category: string) => Product[]
  getCategories: () => string[]
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(mockProducts)

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id)
  }

  const getProductsByCategory = (category: string) => {
    return products.filter((p) => p.category === category)
  }

  const getCategories = () => {
    return Array.from(new Set(products.map((p) => p.category)))
  }

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct = {
      ...product,
      id: Math.random().toString(36).substr(2, 9),
    }
    setProducts([...products, newProduct])
  }

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...product } : p)))
  }

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  const value: ProductContextType = {
    products,
    getProductById,
    getProductsByCategory,
    getCategories,
    addProduct,
    updateProduct,
    deleteProduct,
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
