"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { Product, Show, SearchFilters, SearchResult } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { mapProduct, mapShow, type DbProduct, type DbShow } from "@/lib/db/mappers"

interface SearchContextType {
  searchAll: (filters: SearchFilters) => Promise<SearchResult[]>
  searchProducts: (filters: SearchFilters) => Promise<Product[]>
  searchShows: (filters: SearchFilters) => Promise<Show[]>
  isLoading: boolean
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const normalizeQuery = (query: string) => query.toLowerCase().trim()

  const matchesQuery = (text: string, query: string) => {
    return normalizeQuery(text).includes(normalizeQuery(query))
  }

  const searchProducts = async (filters: SearchFilters): Promise<Product[]> => {
    try {
      setIsLoading(true)
      let query = supabase.from("products").select(`
        *,
        seller:profiles!seller_id(username, display_name)
      `)

      if (filters.category) {
        query = query.eq("category", filters.category)
      }

      if (filters.sellerId) {
        query = query.eq("seller_id", filters.sellerId)
      }

      if (filters.minPrice !== undefined) {
        query = query.gte("price", filters.minPrice)
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte("price", filters.maxPrice)
      }

      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "price_asc":
            query = query.order("price", { ascending: true })
            break
          case "price_desc":
            query = query.order("price", { ascending: false })
            break
          case "popularity":
            query = query.order("sold", { ascending: false })
            break
          case "newest":
            query = query.order("created_at", { ascending: false })
            break
        }
      }

      const { data, error } = await query

      if (error) {
        console.error("[v0] Error searching products:", error)
        return []
      }

      // Map to UI models
      let results = (data || []).map((row: any) => {
        const sellerName = row.seller?.display_name || row.seller?.username || "Unknown Seller"
        return mapProduct(row as DbProduct, sellerName)
      })

      // Client-side filtering for full-text search
      if (filters.query) {
        results = results.filter(
          (p) =>
            matchesQuery(p.name, filters.query!) ||
            matchesQuery(p.description, filters.query!) ||
            matchesQuery(p.category, filters.query!),
        )
      }

      return results
    } catch (error) {
      console.error("[v0] Search products error:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const searchShows = async (filters: SearchFilters): Promise<Show[]> => {
    try {
      setIsLoading(true)
      let query = supabase.from("shows").select(`
        *,
        host:profiles!host_id(username, display_name, avatar_url)
      `)

      if (filters.category) {
        query = query.eq("category", filters.category)
      }

      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "popularity":
            query = query.order("viewer_count", { ascending: false })
            break
          case "newest":
            query = query.order("start_time", { ascending: false })
            break
        }
      }

      const { data, error } = await query

      if (error) {
        console.error("[v0] Error searching shows:", error)
        return []
      }

      // Map to UI models
      let results = (data || []).map((row: any) => {
        const hostName = row.host?.display_name || row.host?.username || "Unknown Host"
        const hostAvatar = row.host?.avatar_url || ""
        return mapShow(row as DbShow, hostName, hostAvatar)
      })

      // Client-side filtering for full-text search and tags
      if (filters.query) {
        results = results.filter(
          (s) =>
            matchesQuery(s.title, filters.query!) ||
            matchesQuery(s.description, filters.query!) ||
            matchesQuery(s.category, filters.query!),
        )
      }

      if (filters.tags && filters.tags.length > 0) {
        results = results.filter((s) => {
          const showTags = s.tags || []
          return filters.tags!.some((tag) => showTags.includes(tag))
        })
      }

      return results
    } catch (error) {
      console.error("[v0] Search shows error:", error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const searchAll = async (filters: SearchFilters): Promise<SearchResult[]> => {
    const [productResults, showResults] = await Promise.all([searchProducts(filters), searchShows(filters)])

    const products = productResults.map((p) => ({
      type: "product" as const,
      id: p.id,
      title: p.name,
      description: p.description,
      image: p.image,
      metadata: { price: p.price, category: p.category },
    }))

    const shows = showResults.map((s) => ({
      type: "show" as const,
      id: s.id,
      title: s.title,
      description: s.description,
      image: s.image,
      metadata: { category: s.category, status: s.status, viewerCount: s.viewerCount },
    }))

    return [...products, ...shows]
  }

  const value: SearchContextType = {
    searchAll,
    searchProducts,
    searchShows,
    isLoading,
  }

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}
