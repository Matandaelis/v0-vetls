"use client"

import type React from "react"

import Link from "next/link"
import type { Product } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Star } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, quantity)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <Card className="relative group overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative overflow-hidden bg-secondary h-48">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {product.stock <= 5 && (
          <div className="absolute top-2 right-2 bg-destructive text-white px-2 py-1 rounded text-xs font-semibold z-10">
            Low Stock
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 relative">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <h3 className="font-semibold line-clamp-2">
              <Link
                href={`/products/${product.id}`}
                className="before:absolute before:inset-0 before:z-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
              >
                {product.name}
              </Link>
            </h3>
            <p className="text-xs text-muted-foreground mt-1 relative z-10">{product.sellerName}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 relative z-10">{product.description}</p>
        <div className="mt-auto relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">(128)</span>
            </div>
          </div>
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="w-full relative z-10"
            variant={isAdded ? "default" : "outline"}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" aria-hidden="true" />
            <span aria-live="polite" aria-atomic="true">
              {isAdded ? "Added!" : "Add to Cart"}
            </span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
