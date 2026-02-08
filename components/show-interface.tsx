"use client"

import type React from "react"

import type { Show, Product } from "@/lib/types"
import { LiveKitPlayer } from "@/components/livekit-player"
import { ShowChat } from "@/components/show-chat"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Bell, Share2, Info, MoreHorizontal, MessageSquare, ShoppingBag, Accessibility } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface ShowInterfaceProps {
  show: Show
  featuredProducts: Product[]
  isLive: boolean
}

export function ShowInterface({ show, featuredProducts, isLive }: ShowInterfaceProps) {
  const { addItem } = useCart()

  return (
    <Tabs defaultValue="shop" className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto pb-8">
      {/* Left Column: Video & Info */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Video Player */}
        <div className="w-full aspect-video bg-black rounded-none md:rounded-2xl overflow-hidden shadow-lg relative">
          <LiveKitPlayer roomName={show.roomName || `show-${show.id}`} />
        </div>

        {/* Show Info Section */}
        <div className="px-4 md:px-0 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              {/* Channel Avatar */}
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <img
                  src={show.hostAvatar || "/placeholder.svg"}
                  alt={show.hostName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                    {isLive ? "Live Now" : "Aired Today at 1:00am"}
                  </span>
                </div>
                <h1 className="font-bold text-lg leading-tight">{show.title}</h1>
                <p className="text-sm text-gray-500 font-medium">{show.hostName}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1.5 h-8 text-xs font-semibold shadow-sm bg-transparent"
            >
              <Bell className="w-3.5 h-3.5" />
              Notify
            </Button>
          </div>

          {/* Action Tabs */}
          <TabsList className="bg-transparent h-auto p-0 justify-start gap-2 overflow-x-auto pb-2 no-scrollbar w-full">
            <TabsTrigger
              value="shop"
              className="rounded-full px-4 py-2 h-auto text-sm font-semibold gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md border-0"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="rounded-full px-4 py-2 h-auto text-sm font-semibold gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md border-0"
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="more"
              className="rounded-full px-4 py-2 h-auto text-sm font-semibold gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md border-0"
            >
              <MoreHorizontal className="w-4 h-4" />
              More
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="rounded-full px-4 py-2 h-auto text-sm font-semibold gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md border-0"
            >
              <Info className="w-4 h-4" />
              About
            </TabsTrigger>
            <TabsTrigger
              value="share"
              className="rounded-full px-4 py-2 h-auto text-sm font-semibold gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md border-0"
            >
              <Share2 className="w-4 h-4" />
              Share
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Right Column: Content Area (Shop/Chat) */}
      <div className="w-full lg:w-[400px] px-4 md:px-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] overflow-hidden relative">
          {/* Shop Tab Content */}
          <TabsContent value="shop" className="m-0 focus-visible:ring-0">
            <div className="p-4 space-y-4">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                        {product.price < 50 && (
                          <span className="text-xs text-gray-400 line-through">
                            ${(product.price * 1.4).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      className="w-fit bg-[#E60023] hover:bg-[#ad001b] text-white rounded-full px-6 h-8 text-sm font-bold shadow-sm"
                      onClick={() => addItem(product, 1)}
                    >
                      Shop
                    </Button>
                  </div>
                </div>
              ))}

              {/* Accessibility Icon (Floating) */}
              <div className="fixed bottom-4 left-4 z-50 md:absolute md:bottom-4 md:left-4">
                <Button
                  size="icon"
                  className="rounded-full bg-[#0057B8] hover:bg-[#004494] text-white shadow-lg h-10 w-10"
                  aria-label="Accessibility settings"
                >
                  <Accessibility className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Chat Tab Content */}
          <TabsContent value="chat" className="m-0 focus-visible:ring-0">
            <div className="h-[500px]">
              <ShowChat hostName={show.hostName} hostAvatar={show.hostAvatar} />
            </div>
          </TabsContent>

          {/* Other Tabs Placeholders */}
          {["more", "about", "share"].map((tab) => (
             <TabsContent key={tab} value={tab} className="m-0 focus-visible:ring-0">
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  <p>Content for {tab} tab</p>
                </div>
             </TabsContent>
          ))}
        </div>
      </div>
    </Tabs>
  )
}
