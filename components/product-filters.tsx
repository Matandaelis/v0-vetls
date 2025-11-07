"use client"

import { Button } from "@/components/ui/button"
import type { SearchFilters } from "@/lib/types"

interface ProductFiltersProps {
  categories: string[]
  selectedCategory?: string
  priceRange: [number, number]
  onCategoryChange: (category: string | undefined) => void
  onPriceChange: (range: [number, number]) => void
  sortBy: SearchFilters["sortBy"]
  onSortChange: (sort: SearchFilters["sortBy"]) => void
}

export function ProductFilters({
  categories,
  selectedCategory,
  priceRange,
  onCategoryChange,
  onPriceChange,
  sortBy,
  onSortChange,
}: ProductFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Sort</h3>
        <select
          value={sortBy || "relevance"}
          onChange={(e) => onSortChange(e.target.value as SearchFilters["sortBy"])}
          className="w-full px-3 py-2 text-sm rounded border bg-background"
        >
          <option value="relevance">Relevance</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popularity">Popularity</option>
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Category</h3>
        <div className="space-y-2">
          <Button
            variant={selectedCategory ? "outline" : "default"}
            size="sm"
            onClick={() => onCategoryChange(undefined)}
            className="w-full justify-start bg-transparent"
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="w-full justify-start bg-transparent"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Price Range</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="1000"
              value={priceRange[0]}
              onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]])}
              placeholder="Min"
              className="w-1/2 px-2 py-1 text-sm rounded border bg-background"
            />
            <input
              type="number"
              min="0"
              max="1000"
              value={priceRange[1]}
              onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
              placeholder="Max"
              className="w-1/2 px-2 py-1 text-sm rounded border bg-background"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            ${priceRange[0]} - ${priceRange[1]}
          </p>
        </div>
      </div>
    </div>
  )
}
