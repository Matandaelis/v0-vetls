"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { ShowCard } from "@/components/show-card"
import { useShows } from "@/contexts/show-context"
import { useState } from "react"
import { Footer } from "@/components/footer"

export default function ShowsPage() {
  const { shows } = useShows()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(shows.map((s) => s.category)))
  const filteredShows = selectedCategory ? shows.filter((s) => s.category === selectedCategory) : shows

  const liveShows = filteredShows.filter((s) => s.status === "live")
  const upcomingShows = filteredShows.filter((s) => s.status === "scheduled")
  const endedShows = filteredShows.filter((s) => s.status === "ended")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Live Shows</h1>
          <p className="text-muted-foreground">Discover and join live shopping shows with your favorite creators</p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-muted-foreground mb-3">FILTER BY CATEGORY</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="sm"
            >
              All Shows
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Live Shows Section */}
        {liveShows.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Badge className="bg-destructive">LIVE</Badge>
              <h2 className="text-2xl font-bold">Now Streaming</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveShows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Shows Section */}
        {upcomingShows.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Upcoming Shows</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingShows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          </section>
        )}

        {/* Ended Shows Section */}
        {endedShows.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Past Shows</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedShows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {filteredShows.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No shows found in this category</p>
            <Button onClick={() => setSelectedCategory(null)}>View All Shows</Button>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  )
}
