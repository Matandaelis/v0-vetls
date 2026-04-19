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
      <section className="relative overflow-hidden bg-gradient-to-br from-foreground to-foreground/90 text-background py-16 md:py-28 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-semibold">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                  Live shopping is here
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-balance leading-tight">
                  Watch, Shop, Save
                </h1>
              </div>
              <p className="text-lg text-background/80 max-w-lg leading-relaxed">
                Join live shopping shows from your favorite creators. Discover exclusive products, get real-time deals, and connect with a community of savvy shoppers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2 px-8">
                  <Play className="w-5 h-5" /> Watch Live Shows
                </Button>
                <Button
                  size="lg"
                  className="border border-background/30 bg-background/10 text-background hover:bg-background/20 font-semibold"
                >
                  Explore Products
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent blur-3xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-accent/30 to-transparent p-1 rounded-2xl">
                <img 
                  src="/placeholder.svg" 
                  alt="Live Shopping" 
                  className="w-full rounded-xl object-cover shadow-2xl" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Now Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">Now Live</h2>
              <p className="text-lg text-muted-foreground">Join these amazing live shows happening right now</p>
            </div>
            <Link href="/live">
              <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold whitespace-nowrap">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {liveShows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {liveShows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-border rounded-lg bg-secondary/30">
              <p className="text-muted-foreground text-lg">No live shows right now. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Shows Section */}
      <section className="py-16 md:py-20 bg-secondary/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">Upcoming Shows</h2>
              <p className="text-lg text-muted-foreground">Set reminders for shows you don&apos;t want to miss</p>
            </div>
            <Link href="/shows">
              <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold whitespace-nowrap">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3 text-foreground">Featured Products</h2>
              <p className="text-lg text-muted-foreground">Trending items from our top sellers</p>
            </div>
            <Link href="/products">
              <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold whitespace-nowrap">
                Shop All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-20 bg-secondary/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-foreground">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category} href={`/category/${category.toLowerCase()}`}>
                <Button
                  className="w-full h-28 text-base font-semibold bg-card border border-border hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-200 flex items-center justify-center"
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
