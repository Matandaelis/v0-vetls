"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/lib/types"

interface FlashSaleProduct extends Product {
  originalPrice: number
  saleEndsAt: Date
  flashSaleDiscount: number
}

interface FlashSaleBannerProps {
  product: FlashSaleProduct
}

export function FlashSaleBanner({ product }: FlashSaleBannerProps) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isEnding, setIsEnding] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const target = new Date(product.saleEndsAt).getTime()
      const diff = Math.max(0, target - now)

      setTimeLeft(diff)
      setIsEnding(diff < 5 * 60 * 1000) // Last 5 minutes
    }, 1000)

    return () => clearInterval(interval)
  }, [product.saleEndsAt])

  const minutes = Math.floor(timeLeft / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)

  return (
    <Card
      className={`overflow-hidden border-2 transition-all ${
        isEnding
          ? "border-red-500 bg-gradient-to-r from-red-50 to-orange-50"
          : "border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50"
      }`}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-lg">Flash Sale!</h3>
          </div>
          <Badge className={isEnding ? "bg-red-600 animate-pulse" : "bg-orange-600"}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </Badge>
        </div>

        {/* Product Section */}
        <div className="flex gap-3">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm line-clamp-2">{product.name}</h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-red-600">${product.price.toFixed(2)}</span>
              <span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
              <span className="text-xs font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                -{product.flashSaleDiscount}%
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-10 gap-2"
          onClick={() => addItem(product, 1)}
        >
          <ShoppingCart className="w-4 h-4" />
          Grab Deal Now
        </Button>

        {product.stock < 10 && (
          <p className="text-xs text-orange-700 font-semibold text-center">Only {product.stock} units available!</p>
        )}
      </div>
    </Card>
  )
}
