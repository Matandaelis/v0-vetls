"use client"

import type React from "react"
import { createContext, useContext } from "react"
import type { Product, Show, SearchFilters, SearchResult } from "@/lib/types"
import { mockProducts, mockShows } from "@/lib/mock-data"

interface SearchContextType {
  searchAll: (filters: SearchFilters) => SearchResult[]
  searchProducts: (filters: SearchFilters) => Product[]
  searchShows: (filters: SearchFilters) => Show[]
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const products = mockProducts
  const shows = mockShows

  const normalizeQuery = (query: string) => query.toLowerCase().trim()

  const matchesQuery = (text: string, query: string) => {
    return normalizeQuery(text).includes(normalizeQuery(query))
  }

  const searchProducts = (filters: SearchFilters): Product[] => {
    let results = products

    if (filters.query) {
      results = results.filter(
        (p) =>
          matchesQuery(p.name, filters.query!) ||
          matchesQuery(p.description, filters.query!) ||
          matchesQuery(p.category, filters.query!) ||
          matchesQuery(p.sellerName, filters.query!),
      )
    }

    if (filters.category) {
      results = results.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase())
    }

    if (filters.minPrice !== undefined) {
      results = results.filter((p) => p.price >= filters.minPrice!)
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter((p) => p.price <= filters.maxPrice!)
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "price_asc":
          results.sort((a, b) => a.price - b.price)
          break
        case "price_desc":
          results.sort((a, b) => b.price - a.price)
          break
        case "popularity":
          results.sort((a, b) => b.stock - a.stock)
          break
        case "newest":
          results.reverse()
          break
      }
    }

    return results
  }

  const searchShows = (filters: SearchFilters): Show[] => {
    let results = shows

    if (filters.query) {
      results = results.filter(
        (s) =>
          matchesQuery(s.title, filters.query!) ||
          matchesQuery(s.description, filters.query!) ||
          matchesQuery(s.category, filters.query!) ||
          matchesQuery(s.hostName, filters.query!) ||
          s.tags.some((tag) => matchesQuery(tag, filters.query!)),
      )
    }

    if (filters.category) {
      results = results.filter((s) => s.category.toLowerCase() === filters.category!.toLowerCase())
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter((s) => filters.tags!.some((tag) => s.tags.includes(tag)))
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "popularity":
          results.sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0))
          break
        case "newest":
          results.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
          break
      }
    }

    return results
  }

  const searchAll = (filters: SearchFilters): SearchResult[] => {
    const productResults = searchProducts(filters).map((p) => ({
      type: "product" as const,
      id: p.id,
      title: p.name,
      description: p.description,
      image: p.image,
      metadata: { price: p.price, category: p.category },
    }))

    const showResults = searchShows(filters).map((s) => ({
      type: "show" as const,
      id: s.id,
      title: s.title,
      description: s.description,
      image: s.image,
      metadata: { category: s.category, status: s.status, viewerCount: s.viewerCount },
    }))

    return [...productResults, ...showResults]
  }

  const value: SearchContextType = {
    searchAll,
    searchProducts,
    searchShows,
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
