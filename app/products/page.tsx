"use client"

import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/contexts/product-context"
import { useSearch } from "@/contexts/search-context"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { SearchFilters } from "@/lib/types"
import { Footer } from "@/components/footer"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const { getCategories } = useProducts()
  const { searchProducts } = useSearch()

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    searchParams.get("category") || undefined,
  )
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [sortBy, setSortBy] = useState<SearchFilters["sortBy"]>("relevance")
  const [products, setProducts] = useState<ReturnType<typeof searchProducts>>([])

  const categories = getCategories()

  useEffect(() => {
    const filtered = searchProducts({
      category: selectedCategory,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      sortBy,
    })
    setProducts(filtered)
  }, [selectedCategory, priceRange, sortBy, searchProducts])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold">Products</h1>
            <p className="text-muted-foreground">
              Browse our collection of {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {/* Sidebar Filters */}
          <div className="md:col-span-1">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              priceRange={priceRange}
              onCategoryChange={setSelectedCategory}
              onPriceChange={setPriceRange}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3 lg:col-span-4">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-secondary/30">
                <p className="text-muted-foreground mb-4">No products match your filters</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory(undefined)
                    setPriceRange([0, 500])
                    setSortBy("relevance")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
