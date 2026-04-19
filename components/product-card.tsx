"use client"

import type React from "react"

import Link from "next/link"
import type { Product } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Star, Check } from "lucide-react"
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
    addItem(product, quantity)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const averageRating = 4.5
  const reviewCount = 128

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col bg-card border border-border">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-secondary aspect-square">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {product.stock <= 5 && (
              <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-semibold">
                Low Stock
              </div>
            )}
            {product.stock > 20 && (
              <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                In Stock
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Product Name */}
          <h3 className="font-semibold text-base line-clamp-2 text-foreground mb-1">
            {product.name}
          </h3>

          {/* Seller Name */}
          <p className="text-xs text-muted-foreground mb-3">
            by {product.sellerName}
          </p>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-foreground">
              {averageRating}
            </span>
            <span className="text-xs text-muted-foreground">
              ({reviewCount})
            </span>
          </div>

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-accent">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={handleAddToCart} 
            className={`w-full py-2.5 font-semibold transition-all ${
              isAdded
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Added to Cart!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </Card>
    </Link>
  )
}
