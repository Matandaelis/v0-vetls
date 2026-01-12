"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface ProductContextType {
  products: Product[]
  getProductById: (id: string) => Product | undefined
  getProductsByCategory: (category: string) => Product[]
  getCategories: () => string[]
  addProduct: (product: Omit<Product, "id">) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  loadProducts: () => Promise<void>
  isLoading: boolean
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("products").select("*")
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("[v0] Error loading products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id)
  }

  const getProductsByCategory = (category: string) => {
    return products.filter((p) => p.category === category)
  }

  const getCategories = () => {
    return Array.from(new Set(products.map((p) => p.category)))
  }

  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      const { error } = await supabase.from("products").insert([product])
      if (error) throw error
      await loadProducts()
    } catch (error) {
      console.error("[v0] Error adding product:", error)
      throw error
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase.from("products").update(updates).eq("id", id)
      if (error) throw error
      await loadProducts()
    } catch (error) {
      console.error("[v0] Error updating product:", error)
      throw error
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id)
      if (error) throw error
      await loadProducts()
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      throw error
    }
  }

  const value: ProductContextType = {
    products,
    getProductById,
    getProductsByCategory,
    getCategories,
    addProduct,
    updateProduct,
    deleteProduct,
    loadProducts,
    isLoading,
  }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error("useProducts must be used within ProductProvider")
  }
  return context
}
