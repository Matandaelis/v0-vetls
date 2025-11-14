"use server"

import Link from "next/link"
import { ArrowLeft, Share2, Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { LiveShowPlayer } from "@/components/live-show-player"
import { ShowSidebar } from "@/components/show-sidebar"
import { ShowProductCarousel } from "@/components/show-product-carousel"
import { format } from "date-fns"
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>

        {/* Main Layout - Player and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Player Section */}
          <div className="lg:col-span-2">
            <LiveShowPlayer show={show} isLive={isLive} />

            {/* Show Description */}
            <Card className="mt-6 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{show.title}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src={show.hostAvatar || "/placeholder.svg"}
                      alt={show.hostName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm">{show.hostName}</p>
                      <p className="text-xs text-muted-foreground">
                        {isLive ? "LIVE NOW" : format(show.startTime, "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Show Info Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={isLive ? "bg-destructive mt-1" : "bg-primary mt-1"}>
                    {show.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold mt-1">{show.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Viewers</p>
                  <p className="font-semibold mt-1">{show.viewerCount?.toLocaleString() || "N/A"}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">About this show</h3>
                <p className="text-muted-foreground leading-relaxed">{show.description}</p>
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {show.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
              <Card className="mt-6 p-6">
                <h3 className="text-2xl font-bold mb-6">Products Featured in This Show</h3>
                <ShowProductCarousel products={featuredProducts} isLive={isLive} />
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <ShowSidebar hostName={show.hostName} hostAvatar={show.hostAvatar} />
          </div>
        </div>

        {/* Mobile Sidebar - Below on mobile */}
        <div className="lg:hidden mb-8">
          <ShowSidebar hostName={show.hostName} hostAvatar={show.hostAvatar} />
        </div>
      </div>
    </div>
  )
}
