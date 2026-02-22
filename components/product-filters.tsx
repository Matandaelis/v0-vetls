"use client"

import type React from "react"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSortChange(e.target.value as SearchFilters["sortBy"])
    },
    [onSortChange],
  )

  const handleCategorySelect = useCallback(
    (category: string | undefined) => {
      onCategoryChange(category)
    },
    [onCategoryChange],
  )

  const handlePriceMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onPriceChange([Number(e.target.value), priceRange[1]])
    },
    [onPriceChange, priceRange],
  )

  const handlePriceMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onPriceChange([priceRange[0], Number(e.target.value)])
    },
    [onPriceChange, priceRange],
  )

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <Label htmlFor="sort-select" className="text-base font-semibold mb-3 block">
          Sort
        </Label>
        <select
          id="sort-select"
          aria-label="Sort products"
          value={sortBy || "relevance"}
          onChange={handleSortChange}
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
        <h3 className="font-semibold text-foreground mb-3 text-base">Category</h3>
        <div className="space-y-2">
          <Button
            variant={selectedCategory ? "outline" : "default"}
            size="sm"
            onClick={() => handleCategorySelect(undefined)}
            className="w-full justify-start bg-transparent"
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategorySelect(category)}
              className="w-full justify-start bg-transparent"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 text-base">Price Range</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              max="1000"
              value={priceRange[0]}
              onChange={handlePriceMinChange}
              placeholder="Min"
              aria-label="Minimum price"
              className="w-1/2"
            />
            <Input
              type="number"
              min="0"
              max="1000"
              value={priceRange[1]}
              onChange={handlePriceMaxChange}
              placeholder="Max"
              aria-label="Maximum price"
              className="w-1/2"
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
