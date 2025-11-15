"use server"

import Link from "next/link"
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { AntMediaPlayer } from "@/components/ant-media-player"
import { ShowSidebar } from "@/components/show-sidebar"
import { ShowProductCarousel } from "@/components/show-product-carousel"
import { ShowChat } from "@/components/show-chat"
import { ShowProductSidebar } from "@/components/show-product-sidebar"
import { mockShows } from "@/lib/mock-data"
import { mockProducts } from "@/lib/mock-data"

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
    <div className="min-h-screen bg-background">
      <Header />

      <div className="w-full">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/shows">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Main Live Shopping Layout - Flex responsive */}
        <div className="flex flex-col lg:flex-row gap-4 px-4 pb-8 max-w-7xl mx-auto">
          
          {/* Left: Video + Products Section */}
          <div className="flex flex-col flex-1 gap-4">
            {/* Live Video Player */}
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <AntMediaPlayer show={show} isLive={isLive} />
            </div>

            {/* Featured Products Carousel - Below video on mobile */}
            {featuredProducts.length > 0 && (
              <div className="lg:hidden rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Featured Products</h3>
                <div className="space-y-3">
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 pb-3 border-b last:border-0">
                      <img 
                        src={product.image || "/placeholder.svg"} 
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                        <p className="text-lg font-bold text-primary mt-1">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar (Chat + Products on desktop) */}
          <div className="w-full lg:w-80 flex flex-col gap-4">
            {/* Chat Section */}
            <div className="rounded-2xl bg-white shadow-lg flex flex-col h-96 lg:h-[500px] overflow-hidden">
              <ShowChat hostName={show.hostName} hostAvatar={show.hostAvatar} />
            </div>

            {/* Featured Products - Desktop only sidebar */}
            {featuredProducts.length > 0 && (
              <div className="hidden lg:block rounded-2xl bg-white p-6 shadow-lg max-h-96 overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">Featured</h3>
                <ShowProductSidebar products={featuredProducts} isLive={isLive} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
