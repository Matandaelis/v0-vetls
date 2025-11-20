"use client"

import type { Clip } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, Play } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/contexts/cart-context"
import { useProducts } from "@/contexts/product-context"
import { toast } from "@/hooks/use-toast"

interface ClipCardProps {
  clip: Clip
}

export function ClipCard({ clip }: ClipCardProps) {
  const { addItem } = useCart()
  const { products } = useProducts()
  const product = products.find((p) => p.id === clip.productId)

  const handleAddToCart = () => {
    if (product) {
      addItem(product)
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
    }
  }

  return (
    <div className="relative aspect-[9/16] bg-black rounded-xl overflow-hidden group">
      {/* Video Placeholder / Thumbnail */}
      <Image
        src={clip.thumbnail || "/placeholder.svg"}
        alt={clip.title}
        fill
        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
      />

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="w-8 h-8 text-white fill-white ml-1" />
        </div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
        {/* Right Side Actions */}
        <div className="absolute right-4 bottom-20 flex flex-col gap-4 items-center">
          <div className="flex flex-col items-center gap-1">
            <Button size="icon" variant="ghost" className="rounded-full bg-black/20 hover:bg-black/40 text-white">
              <Heart className="w-6 h-6" />
            </Button>
            <span className="text-xs text-white font-medium">{clip.likes}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Button size="icon" variant="ghost" className="rounded-full bg-black/20 hover:bg-black/40 text-white">
              <MessageCircle className="w-6 h-6" />
            </Button>
            <span className="text-xs text-white font-medium">Chat</span>
          </div>
          <Button size="icon" variant="ghost" className="rounded-full bg-black/20 hover:bg-black/40 text-white">
            <Share2 className="w-6 h-6" />
          </Button>
        </div>

        {/* Bottom Info */}
        <div className="pr-12">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white">
              <Image src={clip.hostAvatar || "/placeholder.svg"} alt={clip.hostName} fill className="object-cover" />
            </div>
            <span className="text-white font-semibold text-sm">{clip.hostName}</span>
          </div>
          <p className="text-white text-sm mb-4 line-clamp-2">{clip.title}</p>

          {/* Product Link */}
          {product && (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 flex items-center gap-3">
              <div className="relative w-10 h-10 rounded bg-white overflow-hidden shrink-0">
                <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{product.name}</p>
                <p className="text-white/80 text-xs">${product.price}</p>
              </div>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white h-8 px-3"
                onClick={handleAddToCart}
              >
                Shop
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
