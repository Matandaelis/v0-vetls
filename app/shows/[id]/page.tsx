"use server"

import Link from "next/link"
import { ArrowLeft, Bell, Share2, Info, MessageSquare, ShoppingBag } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { AntMediaPlayer } from "@/components/ant-media-player"
import { ShowChat } from "@/components/show-chat"
import { ShowProductList } from "@/components/show-product-list"
import { mockShows } from "@/lib/mock-data"
import { mockProducts } from "@/lib/mock-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function ShowPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const show = mockShows.find((s) => s.id === id)
  const getProductById = (productId: string) => mockProducts.find((p) => p.id === productId)

  if (!show) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Show not found</h1>
          <Link href="/">
            <Button variant="outline" className="mt-4 bg-transparent">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const featuredProducts = show.products.map((productId) => getProductById(productId)).filter(Boolean)
  const isLive = show.status === "live"

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="w-full max-w-4xl mx-auto">
        {/* Video Player Section - Full width on mobile */}
        <div className="w-full bg-black">
          <AntMediaPlayer show={show} isLive={isLive} />
        </div>

        <div className="px-4 py-4">
          {/* Show Info Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10 border border-gray-200">
                <AvatarImage src={show.hostAvatar || "/placeholder.svg"} alt={show.hostName} />
                <AvatarFallback>{show.hostName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Aired Today at 1:00am</p>
                <h1 className="font-bold text-lg leading-tight mb-0.5">{show.title}</h1>
                <p className="text-sm text-gray-600">{show.hostName}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="rounded-full gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium h-8 px-4">
              <Bell className="w-4 h-4" />
              Notify
            </Button>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="shop" className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-gray-100 mb-4 overflow-x-auto flex-nowrap">
              <TabsTrigger 
                value="shop" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none px-4 py-3 gap-2 text-gray-500"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none px-4 py-3 gap-2 text-gray-500"
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="more" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none px-4 py-3 gap-2 text-gray-500"
              >
                <Info className="w-4 h-4" />
                More
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none px-4 py-3 gap-2 text-gray-500"
              >
                <Info className="w-4 h-4" />
                About
              </TabsTrigger>
              <TabsTrigger 
                value="share" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black data-[state=active]:shadow-none px-4 py-3 gap-2 text-gray-500"
              >
                <Share2 className="w-4 h-4" />
                Share
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shop" className="mt-0">
              <ShowProductList products={featuredProducts} />
            </TabsContent>

            <TabsContent value="chat" className="mt-0 h-[500px]">
              <ShowChat hostName={show.hostName} hostAvatar={show.hostAvatar} />
            </TabsContent>

            <TabsContent value="about" className="mt-0 p-4">
              <h3 className="font-bold text-lg mb-2">About this show</h3>
              <p className="text-gray-600 leading-relaxed">{show.description}</p>
            </TabsContent>
            
            <TabsContent value="more" className="mt-0 p-4 text-center text-gray-500">
              More options coming soon
            </TabsContent>
            
            <TabsContent value="share" className="mt-0 p-4 text-center text-gray-500">
              Share options coming soon
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
