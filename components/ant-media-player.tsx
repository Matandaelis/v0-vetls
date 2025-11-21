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
    <div className="relative w-full h-full bg-black group">
      {/* HLS Video Player */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          controlsList="nodownload"
          poster={show.image}
          playsInline
        />

        {!isPlayerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Connecting...</p>
            </div>
          </div>
        )}

        {/* Viewer Count - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/40 backdrop-blur text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            {viewers.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
