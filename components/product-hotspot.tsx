"use client"

import { useState } from "react"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingCart, Heart, X } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface ProductHotspot {
  x: number // 0-100 percentage
  y: number // 0-100 percentage
  productId: string
}

interface ProductHotspotProps {
  products: Product[]
  hotspots: ProductHotspot[]
  isLive?: boolean
}

export function ProductHotspotOverlay({ products, hotspots, isLive = true }: ProductHotspotProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set())
  const { addItem } = useCart()

  const selectedProductData = products.find((p) => p.id === selectedProduct)

  const toggleLike = (productId: string) => {
    setLikedProducts((prev) => {
      const newSet = new Set(prev)
      newSet.has(productId) ? newSet.delete(productId) : newSet.add(productId)
      return newSet
    })
  }

  return (
    <div className="relative w-full h-full">
      {/* Hotspot Markers */}
      {hotspots.map((hotspot) => (
        <button
          key={`hotspot-${hotspot.productId}`}
          onClick={() => setSelectedProduct(hotspot.productId)}
          className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 group"
          style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-pink-500 rounded-full opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-pink-500 rounded-full animate-pulse" />
            <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-pink-500" />
            </div>
          </div>
        </button>
      ))}

      {/* Product Preview Card */}
      {selectedProduct && selectedProductData && (
        <div className="absolute bottom-4 left-4 z-50 w-80 animate-in fade-in slide-in-from-bottom-2">
          <Card className="overflow-hidden shadow-2xl border-0">
            <div className="relative">
              <img
                src={selectedProductData.image || "/placeholder.svg"}
                alt={selectedProductData.name}
                className="w-full h-48 object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full"
                onClick={() => setSelectedProduct(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-3 space-y-3">
              <div>
                <h4 className="font-bold text-sm line-clamp-2">{selectedProductData.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{selectedProductData.sellerName}</p>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-bold text-pink-600">${selectedProductData.price.toFixed(2)}</p>
                  {isLive && selectedProductData.stock <= 5 && (
                    <p className="text-xs text-red-500 font-semibold mt-1">Only {selectedProductData.stock} left!</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white text-sm h-9 gap-1"
                  onClick={() => {
                    addItem(selectedProductData, 1)
                    setSelectedProduct(null)
                  }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-transparent"
                  onClick={() => toggleLike(selectedProductData.id)}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      likedProducts.has(selectedProductData.id) ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
