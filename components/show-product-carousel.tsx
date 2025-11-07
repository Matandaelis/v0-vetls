"use client"

import { useRef, useState } from "react"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface ShowProductCarouselProps {
  products: Product[]
  isLive?: boolean
}

export function ShowProductCarousel({ products, isLive = true }: ShowProductCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(products.length > 3)
  const { addItem } = useCart()

  const checkScroll = () => {
    if (!containerRef.current) return

    setCanScrollLeft(containerRef.current.scrollLeft > 0)
    setCanScrollRight(
      containerRef.current.scrollLeft < containerRef.current.scrollWidth - containerRef.current.clientWidth - 10,
    )
  }

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return

    const scrollAmount = 300
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })

    setTimeout(checkScroll, 500)
  }

  return (
    <div className="space-y-4">
      <div className="relative group">
        {/* Scroll Buttons */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}

        {/* Products Container */}
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
          onScroll={checkScroll}
        >
          {products.map((product) => (
            <Card key={product.id} className="flex-shrink-0 w-64 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative overflow-hidden bg-secondary h-40">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
                {isLive && product.stock <= 5 && (
                  <div className="absolute top-2 right-2 bg-destructive text-white px-2 py-1 rounded text-xs font-semibold">
                    Low Stock
                  </div>
                )}
              </div>

              <div className="p-3">
                <h4 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h4>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{product.sellerName}</p>

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
                  </div>
                  <Button size="sm" className="gap-1" onClick={() => addItem(product, 1)}>
                    <ShoppingCart className="w-3 h-3" />
                    Add
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
