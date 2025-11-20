"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ShowCard } from "@/components/show-card"
import { useShows } from "@/contexts/show-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LivePage() {
  const { shows } = useShows()
  const liveShows = shows.filter((s) => s.status === "live")

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">Live Now</h1>
              <Badge className="bg-destructive animate-pulse">LIVE</Badge>
            </div>
            <p className="text-muted-foreground">Watch live shopping shows happening right now</p>
          </div>
        </div>

        {liveShows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveShows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border rounded-xl bg-secondary/20">
            <h3 className="text-2xl font-semibold mb-2">No shows are live right now</h3>
            <p className="text-muted-foreground mb-6">Check back later or browse our upcoming scheduled shows.</p>
            <Link href="/shows">
              <Button size="lg">Browse Upcoming Shows</Button>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
