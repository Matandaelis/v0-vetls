"use client"

import { useState, useEffect } from "react"
import type { Product, Show } from "../lib/types"
import { LiveKitRoom, VideoConference, GridLayout, useTracks, useConnectionState, useParticipants } from "@livekit/components-react"
import { Track, ConnectionState } from "livekit-client"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card"
import { ShoppingCart, Heart, Pin, PinOff, Users, MessageSquare, Mic, MicOff, Video, VideoOff, ShoppingBag } from "lucide-react"
import { ShowChat } from "../components/show-chat"
import { useCart } from "../contexts/cart-context"
import { usePinnedProduct } from "../hooks/usePinnedProduct"
import { cn } from "../lib/utils"
import "@livekit/components-styles"

interface LiveShoppingVideoConferenceProps {
  roomName: string
  username: string
  products: Product[]
  show: Show
  isHost?: boolean
  initialPinnedProduct?: Product | null
}

export function LiveShoppingVideoConference({ 
  roomName, 
  username, 
  products, 
  show, 
  isHost = false, 
  initialPinnedProduct = null 
}: LiveShoppingVideoConferenceProps) {
  const [token, setToken] = useState("")
  const [showChat, setShowChat] = useState(true)
  const [showProductSidebar, setShowProductSidebar] = useState(false)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const { addItem } = useCart()
  
  const { 
    pinnedProduct, 
    isPinned, 
    pinProduct, 
    unpinProduct, 
    togglePin 
  } = usePinnedProduct(initialPinnedProduct)

  // Fetch LiveKit token
  useEffect(() => {
    ;(async () => {
      try {
        const resp = await fetch(`/api/livekit/token?room=${roomName}&username=${username}&admin=${isHost}`)
        const data = await resp.json()
        setToken(data.token)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [roomName, username, isHost])

  // Fetch viewer count periodically
  useEffect(() => {
    if (!token) return
    
    const fetchViewerCount = async () => {
      try {
        const resp = await fetch(`/api/livekit/rooms/status?room=${roomName}`)
        if (resp.ok) {
          const data = await resp.json()
          const count = data.participants?.length || 0
          setViewerCount(count)
        }
      } catch (error) {
        console.error('Error fetching viewer count:', error)
      }
    }

    fetchViewerCount()
    const interval = setInterval(fetchViewerCount, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [token, roomName])

  if (token === "") {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      <LiveKitRoom
        video={isHost}
        audio={isHost}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        style={{ height: "100%", width: "100%" }}
      >
        <div className="flex flex-col h-full relative">
          {/* Video Conference Area */}
          <div className="flex-1 relative">
            <VideoConferenceArea 
              isHost={isHost}
              isCameraEnabled={isCameraEnabled}
              isMicEnabled={isMicEnabled}
              viewerCount={viewerCount}
              show={show}
            />
          </div>

          {/* Bottom Controls */}
          <div className="p-4 bg-black/80 backdrop-blur border-t border-white/10">
            <Controls 
              isHost={isHost}
              isCameraEnabled={isCameraEnabled}
              isMicEnabled={isMicEnabled}
              onToggleCamera={() => setIsCameraEnabled(!isCameraEnabled)}
              onToggleMic={() => setIsMicEnabled(!isMicEnabled)}
              showChat={showChat}
              onToggleChat={() => setShowChat(!showChat)}
              showProductSidebar={showProductSidebar}
              onToggleProductSidebar={() => setShowProductSidebar(!showProductSidebar)}
              viewerCount={viewerCount}
            />
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="absolute top-4 right-4 bottom-20 w-80 bg-white/90 backdrop-blur rounded-lg shadow-lg border border-white/20 overflow-hidden">
            <ShowChat 
              hostName={show.hostName}
              hostAvatar={show.hostAvatar}
              viewerCount={viewerCount}
            />
          </div>
        )}

        {/* Product Sidebar */}
        {showProductSidebar && (
          <div className="absolute top-4 left-4 bottom-20 w-80 bg-white/90 backdrop-blur rounded-lg shadow-lg border border-white/20 overflow-hidden p-4">
            <ProductSidebar 
              products={products}
              pinnedProduct={pinnedProduct}
              isHost={isHost}
              onPinProduct={pinProduct}
              onUnpinProduct={unpinProduct}
              onTogglePin={togglePin}
            />
          </div>
        )}

        {/* Pinned Product Display (for viewers) */}
        {pinnedProduct && !isHost && (
          <div className="absolute bottom-20 left-4 right-4 md:right-96 bg-white/90 backdrop-blur rounded-lg shadow-lg border border-white/20 p-4">
            <PinnedProductDisplay 
              product={pinnedProduct}
              onAddToCart={() => addItem(pinnedProduct, 1)}
            />
          </div>
        )}
      </LiveKitRoom>
    </div>
  )
}

function VideoConferenceArea({ 
  isHost, 
  isCameraEnabled, 
  isMicEnabled, 
  viewerCount, 
  show 
}: { 
  isHost: boolean
  isCameraEnabled: boolean
  isMicEnabled: boolean
  viewerCount: number
  show: Show
}) {
  const connectionState = useConnectionState()
  const participants = useParticipants()
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare])

  if (connectionState !== ConnectionState.Connected) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Connecting to stream...</p>
          <p className="text-sm text-gray-400">Please wait while we establish the connection</p>
        </div>
      </div>
    )
  }

  if (tracks.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Stream is offline</p>
          <p className="text-sm text-gray-400 mb-4">
            {viewerCount > 0 
              ? "Host is experiencing technical difficulties"
              : "Waiting for host to start streaming..."
            }
          </p>
          <div className="animate-pulse bg-gray-800 rounded h-2 w-32 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <VideoConference>
        <GridLayout tracks={tracks} style={{ height: "100%" }}>
          {/* GridLayout requires children */}
          {tracks.map((track, index) => (
            <div key={index} className="w-full h-full"></div>
          ))}
        </GridLayout>
      </VideoConference>

      {/* Live indicator */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="destructive" className="animate-pulse">
          🔴 LIVE
        </Badge>
      </div>

      {/* Viewer count */}
      <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold">
        <Users className="w-3.5 h-3.5" />
        {viewerCount} watching
      </div>

      {/* Show title */}
      <div className="absolute top-4 left-24 z-10 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-full text-sm font-medium">
        {show.title}
      </div>
    </div>
  )
}

function Controls({ 
  isHost, 
  isCameraEnabled, 
  isMicEnabled, 
  onToggleCamera, 
  onToggleMic, 
  showChat, 
  onToggleChat, 
  showProductSidebar, 
  onToggleProductSidebar,
  viewerCount
}: { 
  isHost: boolean
  isCameraEnabled: boolean
  isMicEnabled: boolean
  onToggleCamera: () => void
  onToggleMic: () => void
  showChat: boolean
  onToggleChat: () => void
  showProductSidebar: boolean
  onToggleProductSidebar: () => void
  viewerCount: number
}) {
  return (
    <div className="flex items-center justify-between">
      {/* Left controls */}
      <div className="flex items-center gap-2">
        {isHost && (
          <Button
            variant={isCameraEnabled ? "secondary" : "destructive"}
            size="icon"
            onClick={onToggleCamera}
            className="rounded-full"
          >
            {isCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
        )}

        {isHost && (
          <Button
            variant={isMicEnabled ? "secondary" : "destructive"}
            size="icon"
            onClick={onToggleMic}
            className="rounded-full"
          >
            {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
        )}

        <Button
          variant={showChat ? "default" : "secondary"}
          size="sm"
          onClick={onToggleChat}
          className="gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          {showChat ? "Hide Chat" : "Show Chat"}
        </Button>

        <Button
          variant={showProductSidebar ? "default" : "secondary"}
          size="sm"
          onClick={onToggleProductSidebar}
          className="gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          {showProductSidebar ? "Hide Products" : "Show Products"}
        </Button>
      </div>

      {/* Right side - Status */}
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="animate-pulse">
          LIVE
        </Badge>
        <span className="text-sm text-white/80">{viewerCount} viewers</span>
      </div>
    </div>
  )
}

function ProductSidebar({ 
  products, 
  pinnedProduct, 
  isHost, 
  onPinProduct, 
  onUnpinProduct, 
  onTogglePin 
}: { 
  products: Product[]
  pinnedProduct: Product | null
  isHost: boolean
  onPinProduct: (product: Product) => void
  onUnpinProduct: () => void
  onTogglePin: (product: Product) => void
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <ShoppingBag className="w-5 h-5" />
        Featured Products
      </h3>

      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {products.map((product) => (
          <ProductCard 
            key={product.id}
            product={product}
            isPinned={pinnedProduct?.id === product.id}
            isHost={isHost}
            onPinProduct={onPinProduct}
            onUnpinProduct={onUnpinProduct}
            onTogglePin={onTogglePin}
          />
        ))}
      </div>
    </div>
  )
}

function ProductCard({ 
  product, 
  isPinned, 
  isHost, 
  onPinProduct, 
  onUnpinProduct, 
  onTogglePin 
}: { 
  product: Product
  isPinned: boolean
  isHost: boolean
  onPinProduct: (product: Product) => void
  onUnpinProduct: () => void
  onTogglePin: (product: Product) => void
}) {
  const { addItem } = useCart()
  const [liked, setLiked] = useState(false)

  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Product Image */}
          <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h4>
                <p className="text-xs text-gray-600">{product.sellerName}</p>
                <p className="text-lg font-bold text-[#E60023] mt-1">${product.price.toFixed(2)}</p>
              </div>

              {isHost && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onTogglePin(product)}
                >
                  {isPinned ? (
                    <PinOff className="w-4 h-4 text-[#E60023]" />
                  ) : (
                    <Pin className="w-4 h-4 text-gray-600" />
                  )}
                </Button>
              )}
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                className="flex-1 bg-[#E60023] hover:bg-[#ad001b] text-white rounded-full h-8 text-xs font-bold"
                onClick={() => addItem(product, 1)}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Shop
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setLiked(!liked)}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PinnedProductDisplay({ 
  product, 
  onAddToCart 
}: { 
  product: Product
  onAddToCart: () => void
}) {
  const [liked, setLiked] = useState(false)

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Featured Product</CardTitle>
        <CardDescription className="text-sm">
          Currently pinned by the host
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base line-clamp-2 mb-2">{product.name}</h3>

            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Seller: {product.sellerName}</p>
                <p className="text-sm text-gray-600">Category: {product.category}</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-[#E60023]">${product.price.toFixed(2)}</p>
                {product.stock <= 5 && (
                  <Badge variant="destructive" className="mt-1">
                    Low Stock ({product.stock} left)
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-700 line-clamp-3">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2">
        <div className="flex gap-2 w-full">
          <Button
            className="flex-1 bg-[#E60023] hover:bg-[#ad001b] text-white rounded-full h-10 font-bold"
            onClick={onAddToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>

          <Button
            variant="outline"
            className="h-10 w-10 p-0"
            onClick={() => setLiked(!liked)}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}