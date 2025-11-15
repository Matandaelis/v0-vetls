"use client"

import { useEffect, useRef, useState } from "react"
import type { Show } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Share2, Volume2, Volume1, X, ShoppingCart, Users } from 'lucide-react'
import { ShowProductCarousel } from "@/components/show-product-carousel"
import { useProducts } from "@/contexts/product-context"

interface AntMediaPlayerProps {
  show: Show
  isLive?: boolean
}

export function AntMediaPlayer({ show, isLive = true }: AntMediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [viewers, setViewers] = useState(show.viewerCount || 0)
  const [showProductOverlay, setShowProductOverlay] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const { getProductById } = useProducts()

  useEffect(() => {
    if (!show.hlsUrl || !videoRef.current || !isLive) return

    try {
      // Check if HLS is supported
      if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = show.hlsUrl
        videoRef.current.play().catch(err => console.log("Auto-play failed:", err))
        setIsPlayerReady(true)
      }
    } catch (error) {
      console.error("Error loading HLS stream:", error)
    }
  }, [show.hlsUrl, isLive])

  // Simulate viewer count changes (replace with real metrics from Ant Media)
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setViewers((prev) => Math.max(0, prev + Math.floor(Math.random() * 50 - 20)))
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  const featuredProducts = show.products.map((productId) => getProductById(productId)).filter(Boolean)

  return (
    <div className="relative w-full bg-black rounded-2xl overflow-hidden shadow-xl">
      {/* HLS Video Player */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center group">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          controlsList="nodownload"
          poster={show.image}
        />

        {!isPlayerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Connecting to stream...</p>
            </div>
          </div>
        )}

        {/* Live Badge and Viewer Count */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          {isLive && (
            <Badge className="bg-gradient-to-r from-pink-600 to-red-600 text-white animate-pulse">
              LIVE
            </Badge>
          )}
          <div className="bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
            <Users className="w-3 h-3" />
            {viewers.toLocaleString()}
          </div>
        </div>

        {/* Overlay Controls */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Bottom Controls */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted
                  setIsMuted(!isMuted)
                }
              }}
            >
              {isMuted ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {featuredProducts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-4 left-4 bg-black/60 border-white/30 text-white hover:bg-black/80 rounded-full"
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
                Products ({featuredProducts.length})
              </>
            )}
          </Button>
        )}
      </div>

      {showProductOverlay && featuredProducts.length > 0 && (
        <div className="bg-black border-t border-gray-800 p-4">
          <h4 className="font-semibold text-sm mb-4 text-white">Featured Products</h4>
          <ShowProductCarousel products={featuredProducts} isLive={isLive} />
        </div>
      )}

      <div className="bg-gradient-to-r from-gray-950 to-black p-4 border-t border-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-white truncate">{show.title}</h3>
            <p className="text-sm text-gray-400 mt-1">with <span className="font-semibold text-gray-300">{show.hostName}</span></p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {show.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs bg-gray-900 border-gray-700 text-gray-300">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
