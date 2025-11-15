"use client"

import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart } from 'lucide-react'
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"

interface ShowProductSidebarProps {
  products: Product[]
  isLive?: boolean
}

export function ShowProductSidebar({ products, isLive = true }: ShowProductSidebarProps) {
  const { addItem } = useCart()
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set())

  const toggleLike = (productId: string) => {
    setLikedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="bg-gray-50 rounded-xl p-3 hover:shadow-md transition-shadow border border-gray-200"
        >
          {/* Product Image */}
          <div className="relative mb-3 overflow-hidden rounded-lg h-32 bg-gray-200">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
            {isLive && product.stock <= 5 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                Low Stock
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <div>
              <p className="font-bold text-sm line-clamp-2 text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-600 mt-1">{product.sellerName}</p>
            </div>

            {/* Price */}
            <p className="text-xl font-bold text-pink-600">${product.price.toFixed(2)}</p>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white rounded-lg h-8 text-xs gap-1"
                onClick={() => addItem(product, 1)}
              >
                <ShoppingCart className="w-3 h-3" />
                Shop
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="h-8 w-8 rounded-lg"
                onClick={() => toggleLike(product.id)}
              >
                <Heart className={`w-4 h-4 ${likedProducts.has(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
