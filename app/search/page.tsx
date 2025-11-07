"use client"

import type React from "react"

import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Header } from "@/components/header"
import { SearchResultCard } from "@/components/search-result-card"
import { useSearch } from "@/contexts/search-context"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { SearchFilters } from "@/lib/types"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { searchAll } = useSearch()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [results, setResults] = useState<ReturnType<typeof searchAll>>([])
  const [sortBy, setSortBy] = useState<SearchFilters["sortBy"]>("relevance")
  const [filterType, setFilterType] = useState<"all" | "products" | "shows">("all")
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(500)

  useEffect(() => {
    if (query.trim()) {
      const allResults = searchAll({
        query,
        sortBy,
        minPrice: filterType === "products" ? minPrice : undefined,
        maxPrice: filterType === "products" ? maxPrice : undefined,
      })

      const filtered = filterType === "all" ? allResults : allResults.filter((r) => r.type === filterType)

      setResults(filtered)
    } else {
      setResults([])
    }
  }, [query, sortBy, filterType, minPrice, maxPrice, searchAll])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      window.history.pushState(null, "", `/search?q=${encodeURIComponent(query)}`)
    }
  }

  const productCount = results.filter((r) => r.type === "product").length
  const showCount = results.filter((r) => r.type === "show").length

  const priceStats = useMemo(() => {
    const prices = results
      .filter((r) => r.type === "product" && r.metadata?.price)
      .map((r) => r.metadata!.price as number)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }, [results])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2 mb-4">
            <Link href="/">
              <Button variant="outline" size="icon" className="flex-shrink-0 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Input
              placeholder="Search products, shows, brands, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-lg py-6"
              autoFocus
            />
            <Button type="submit" size="lg" className="flex-shrink-0">
              Search
            </Button>
          </div>
        </form>

        {query.trim() ? (
          <>
            {/* Filter Controls */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground font-semibold">Filter:</span>
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterType === "products" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("products")}
                >
                  Products
                </Button>
                <Button
                  variant={filterType === "shows" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("shows")}
                >
                  Shows
                </Button>
              </div>

              {/* Price Filter for Products */}
              {filterType !== "shows" && (
                <Card className="p-4 bg-secondary/50">
                  <p className="text-sm font-semibold mb-3">Price Range</p>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Min</label>
                      <input
                        type="number"
                        min="0"
                        max={maxPrice}
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full px-2 py-1 text-sm rounded border bg-background"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">Max</label>
                      <input
                        type="number"
                        min={minPrice}
                        max="1000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full px-2 py-1 text-sm rounded border bg-background"
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* Sort Controls */}
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground font-semibold">Sort:</span>
                <select
                  value={sortBy || "relevance"}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 text-sm rounded border bg-background"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popularity">Popularity</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Found{" "}
                <span className="font-semibold text-foreground">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </span>
                {filterType === "all" && (
                  <>
                    {" "}
                    ({productCount} product{productCount !== 1 ? "s" : ""}, {showCount} show
                    {showCount !== 1 ? "s" : ""})
                  </>
                )}
              </p>
            </div>

            {/* Results Grid */}
            {results.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {results.map((result) => (
                  <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No results found for "{query}"</p>
                <Link href="/">
                  <Button variant="outline">Return to Home</Button>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Enter a search term to get started</p>
            <p className="text-sm text-muted-foreground">Search for products, shows, brands, or browse by category</p>
          </div>
        )}
      </div>
    </div>
  )
}
