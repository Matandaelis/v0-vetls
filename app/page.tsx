"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { ShowCard } from "@/components/show-card"
import { ProductCard } from "@/components/product-card"
import { useProducts } from "@/contexts/product-context"
import { mockShows } from "@/lib/mock-data"
import { ArrowRight, Play } from "lucide-react"

export default function HomePage() {
  const { products, getCategories } = useProducts()
  const categories = getCategories()

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockShows.slice(0, 2).map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
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
            {mockShows.slice(1).map((show) => (
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
            {products.slice(0, 4).map((product) => (
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

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <h4 className="font-semibold mb-3">Shop</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>
                  <Link href="#">Products</Link>
                </li>
                <li>
                  <Link href="#">Categories</Link>
                </li>
                <li>
                  <Link href="#">Deals</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Watch</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>
                  <Link href="#">Live Shows</Link>
                </li>
                <li>
                  <Link href="#">Upcoming</Link>
                </li>
                <li>
                  <Link href="#">Archive</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>
                  <Link href="#">About</Link>
                </li>
                <li>
                  <Link href="#">Contact</Link>
                </li>
                <li>
                  <Link href="#">Careers</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>
                  <Link href="#">Privacy</Link>
                </li>
                <li>
                  <Link href="#">Terms</Link>
                </li>
                <li>
                  <Link href="#">Cookies</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-80">
            <p>&copy; 2025 TalkShop Live. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
