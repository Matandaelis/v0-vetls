"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { ShowCard } from "@/components/show-card"
import { ProductCard } from "@/components/product-card"
import { useProducts } from "@/contexts/product-context"
import { useShows } from "@/contexts/show-context"
import { ArrowRight, Play } from "lucide-react"
import { Footer } from "@/components/footer"

export default function HomePage() {
  const { products, getCategories } = useProducts()
  const { shows } = useShows()
  const categories = getCategories()

  const liveShows = shows.filter((s) => s.status === "live").slice(0, 3)
  const featuredProducts = products.slice(0, 6)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Live Shopping, Real Connections</h1>
              <p className="text-lg mb-6 opacity-90">
                Watch live shows, discover amazing products, and shop in real-time with your favorite creators.
              </p>
              <div className="flex gap-3">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Play className="w-4 h-4" /> Watch Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-primary border-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img src="/live-shopping-platform.jpg" alt="Live Shopping" className="w-full rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Live Now Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Live Now</h2>
              <p className="text-muted-foreground">Tune in to live shows happening right now</p>
            </div>
            <Link href="/live">
              <Button variant="outline" className="gap-2 bg-transparent">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {liveShows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {liveShows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-secondary/20">
              <p className="text-muted-foreground">No live shows right now. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Shows Section */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Upcoming Shows</h2>
              <p className="text-muted-foreground">Don't miss out on upcoming events</p>
            </div>
            <Link href="/shows">
              <Button variant="outline" className="gap-2 bg-transparent">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shows
              .filter((s) => s.status === "scheduled")
              .slice(0, 3)
              .map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Trending products from our top sellers</p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="gap-2 bg-transparent">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category} href={`/category/${category.toLowerCase()}`}>
                <Button
                  variant="outline"
                  className="w-full h-24 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
                >
                  {category}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
