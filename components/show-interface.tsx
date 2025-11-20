"use client"

import type React from "react"

import { useState } from "react"
import type { Show, Product } from "@/lib/types"
import { LiveKitIframeEmbed } from "@/components/livekit-iframe-embed"
import { ShowChat } from "@/components/show-chat"
import { Button } from "@/components/ui/button"
import { Bell, Share2, Info, MoreHorizontal, MessageSquare, ShoppingBag, Accessibility } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/cart-context"

interface ShowInterfaceProps {
  show: Show
  featuredProducts: Product[]
  isLive: boolean
}

export function ShowInterface({ show, featuredProducts, isLive }: ShowInterfaceProps) {
  const [activeTab, setActiveTab] = useState<"shop" | "chat" | "more" | "about" | "share">("shop")
  const { addItem } = useCart()

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto pb-8">
      {/* Left Column: Video & Info */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Video Player - Replaced AntMediaPlayer with LiveKitIframeEmbed */}
        <LiveKitIframeEmbed roomName={show.id} />

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
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <TabButton
              active={activeTab === "shop"}
              onClick={() => setActiveTab("shop")}
              icon={<ShoppingBag className="w-4 h-4" />}
              label="Shop"
            />
            <TabButton
              active={activeTab === "chat"}
              onClick={() => setActiveTab("chat")}
              icon={<MessageSquare className="w-4 h-4" />}
              label="Chat"
            />
            <TabButton
              active={activeTab === "more"}
              onClick={() => setActiveTab("more")}
              icon={<MoreHorizontal className="w-4 h-4" />}
              label="More"
            />
            <TabButton
              active={activeTab === "about"}
              onClick={() => setActiveTab("about")}
              icon={<Info className="w-4 h-4" />}
              label="About"
            />
            <TabButton
              active={activeTab === "share"}
              onClick={() => setActiveTab("share")}
              icon={<Share2 className="w-4 h-4" />}
              label="Share"
            />
          </div>
        </div>
      </div>

      {/* Right Column: Content Area (Shop/Chat) */}
      <div className="w-full lg:w-[400px] px-4 md:px-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] overflow-hidden relative">
          {/* Shop Tab Content */}
          {activeTab === "shop" && (
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
                >
                  <Accessibility className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Chat Tab Content */}
          {activeTab === "chat" && (
            <div className="h-[500px]">
              <ShowChat hostName={show.hostName} hostAvatar={show.hostAvatar} />
            </div>
          )}

          {/* Other Tabs Placeholders */}
          {["more", "about", "share"].includes(activeTab) && (
            <div className="h-[400px] flex items-center justify-center text-gray-500">
              <p>Content for {activeTab} tab</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap",
        active ? "bg-black text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
