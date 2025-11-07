"use client"

import { useState, useEffect } from "react"
import type { Show, Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Share2, Volume2, Volume1, X, ShoppingCart } from "lucide-react"
import { ShowProductCarousel } from "@/components/show-product-carousel"
import { useProducts } from "@/contexts/product-context"

interface LiveShowPlayerProps {
  show: Show
  isLive?: boolean
}

export function LiveShowPlayer({ show, isLive = true }: LiveShowPlayerProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [viewers, setViewers] = useState(show.viewerCount || 0)
  const [showProductOverlay, setShowProductOverlay] = useState(false)
  const { getProductById } = useProducts()

  // Simulate viewer count changes
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setViewers((prev) => Math.max(0, prev + Math.floor(Math.random() * 50 - 20)))
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  const featuredProducts = show.products.map((productId) => getProductById(productId)).filter(Boolean) as Product[]

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      {/* Video Player */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center group">
        <img
          src={show.image || "/placeholder.svg"}
          alt={show.title}
          className="w-full h-full object-cover opacity-30"
        />

        {/* Overlay Controls */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Top Info */}
          <div className="flex items-start justify-between">
            {isLive && <Badge className="bg-destructive">LIVE</Badge>}
            <div className="text-white text-right">
              <p className="text-sm font-medium">{viewers.toLocaleString()} viewers</p>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {featuredProducts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-4 left-4 bg-black/50 border-white/20 text-white hover:bg-black/70"
            onClick={() => setShowProductOverlay(!showProductOverlay)}
          >
            {showProductOverlay ? (
              <>
                <X className="w-4 h-4 mr-1" />
                Hide Products
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1" />
                View Products ({featuredProducts.length})
              </>
            )}
          </Button>
        )}
      </div>

      {showProductOverlay && featuredProducts.length > 0 && (
        <div className="bg-gray-950 border-t border-border p-4">
          <h4 className="font-semibold text-sm mb-4 text-white">Featured Products</h4>
          <ShowProductCarousel products={featuredProducts} isLive={isLive} />
        </div>
      )}

      {/* Show Info Bar */}
      <div className="bg-gray-950 p-4 border-t border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{show.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">with {show.hostName}</p>
          </div>
          <div className="flex items-center gap-2">
            {show.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
