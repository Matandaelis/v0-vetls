"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { mapProduct, productToDb, type DbProduct, type DbProfile } from "@/lib/db/mappers"

interface ProductContextType {
  products: Product[]
  getProductById: (id: string) => Product | undefined
  fetchProductById: (id: string) => Promise<Product | undefined>
  getProductsByCategory: (category: string) => Product[]
  getCategories: () => string[]
  addProduct: (product: Omit<Product, "id">) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  loadProducts: (page?: number, limit?: number) => Promise<void>
  loadMore: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from("products").select("category")
      if (error) throw error
      const uniqueCategories = Array.from(new Set((data || []).map((p: any) => p.category)))
      setCategories(uniqueCategories as string[])
    } catch (error) {
      console.error("[v0] Error loading categories:", error)
    }
  }

  const loadProducts = async (page = 1, limit = 20) => {
    try {
      if (page === 1) setIsLoading(true)
      // Join with profiles to get seller information
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          seller:profiles!seller_id(username, display_name)
        `)
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

      // Map database rows to UI Product models
      const mappedProducts = (data || []).map((row: any) => {
        const sellerName = row.seller?.display_name || row.seller?.username || "Unknown Seller"
        return mapProduct(row as DbProduct, sellerName)
      })

      if (page === 1) {
        setProducts(mappedProducts)
      } else {
        setProducts((prev) => [...prev, ...mappedProducts])
      }

      setHasMore(mappedProducts.length === limit)
    } catch (error) {
      console.error("[v0] Error loading products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = async () => {
    if (!hasMore || isLoading) return
    const nextPage = Math.floor(products.length / 20) + 1
    await loadProducts(nextPage)
  }

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id)
  }

  const fetchProductById = async (id: string): Promise<Product | undefined> => {
    const existing = products.find((p) => p.id === id)
    if (existing) return existing

    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          seller:profiles!seller_id(username, display_name)
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      if (!data) return undefined

      const sellerName = data.seller?.display_name || data.seller?.username || "Unknown Seller"
      return mapProduct(data as DbProduct, sellerName)
    } catch (error) {
      console.error("[v0] Error fetching product by ID:", error)
      return undefined
    }
  }

  const getProductsByCategory = (category: string) => {
    return products.filter((p) => p.category === category)
  }

  const getCategories = () => {
    return categories
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
    fetchProductById,
    getProductsByCategory,
    getCategories,
    addProduct,
    updateProduct,
    deleteProduct,
    loadProducts,
    loadMore,
    hasMore,
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
