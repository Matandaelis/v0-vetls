"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { mapProduct, productToDb, type DbProduct, type DbProfile } from "@/lib/db/mappers"

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
      // Join with profiles to get seller information
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          seller:profiles!seller_id(username, display_name)
        `)
      if (error) throw error
      
      // Map database rows to UI Product models
      const mappedProducts = (data || []).map((row: any) => {
        const sellerName = row.seller?.display_name || row.seller?.username || "Unknown Seller"
        return mapProduct(row as DbProduct, sellerName)
      })
      
      setProducts(mappedProducts)
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
      const dbProduct = productToDb(product)
      const { error } = await supabase.from("products").insert([dbProduct])
      if (error) throw error
      await loadProducts()
    } catch (error) {
      console.error("[v0] Error adding product:", error)
      throw error
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const dbUpdates = productToDb(updates as Omit<Product, "id" | "sellerName">)
      const { error } = await supabase.from("products").update(dbUpdates).eq("id", id)
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
