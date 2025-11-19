"use client"

import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { Accessibility } from 'lucide-react'

interface ShowProductListProps {
  products: Product[]
}

export function ShowProductList({ products }: ShowProductListProps) {
  const { addItem } = useCart()

  return (
    <div className="space-y-4 pb-20">
      {products.map((product) => {
        // Simulate an original price for the "sale" look in the screenshot
        const originalPrice = product.price * 1.4
        
        return (
          <div 
            key={product.id} 
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex gap-4"
          >
            {/* Product Image */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg bg-gray-100"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                {product.name}
              </h3>
              
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-bold text-lg text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              </div>

              <Button 
                className="w-fit bg-[#E60023] hover:bg-[#ad001b] text-white rounded-full px-6 h-8 text-sm font-semibold"
                onClick={() => addItem(product, 1)}
              >
                Shop
              </Button>
            </div>
          </div>
        )
      })}
      
      {/* Floating Accessibility Icon from screenshot */}
      <div className="fixed bottom-6 left-4 z-50">
        <Button size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 shadow-lg">
          <Accessibility className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
