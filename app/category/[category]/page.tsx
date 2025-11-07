"use client"

import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { ShowCard } from "@/components/show-card"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/contexts/product-context"
import { useShows } from "@/contexts/show-context"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CategoryPage() {
  const params = useParams()
  const category = Array.isArray(params.category) ? params.category[0] : params.category
  const displayCategory = decodeURIComponent(category).replace(/[-_]/g, " ")

  const { getProductsByCategory, getCategories } = useProducts()
  const { getShowsByCategory } = useShows()

  const products = getProductsByCategory(displayCategory)
  const shows = getShowsByCategory(displayCategory)
  const allCategories = getCategories()

  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      Electronics: "from-blue-500 to-blue-600",
      Fashion: "from-purple-500 to-purple-600",
      Beauty: "from-pink-500 to-pink-600",
      Home: "from-amber-500 to-amber-600",
      Technology: "from-cyan-500 to-cyan-600",
    }
    return colors[displayCategory] || "from-gray-500 to-gray-600"
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className={`bg-gradient-to-r ${getCategoryColor()} text-white py-12 md:py-16`}>
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{displayCategory}</h1>
          <p className="text-lg opacity-90">
            Explore our collection of {displayCategory.toLowerCase()} products and exclusive shows
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Other Categories */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-muted-foreground mb-3">OTHER CATEGORIES</p>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <Link key={cat} href={`/category/${cat.toLowerCase()}`}>
                <Button variant={cat === displayCategory ? "default" : "outline"} size="sm" className="bg-transparent">
                  {cat}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Shows Section */}
        {shows.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Shows</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          </section>
        )}

        {/* Products Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Products <span className="text-muted-foreground text-lg">({products.length})</span>
            </h2>
            <Link href={`/products?category=${encodeURIComponent(displayCategory)}`}>
              <Button variant="outline" className="bg-transparent">
                View All
              </Button>
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-secondary/30">
              <p className="text-muted-foreground mb-4">No products found in {displayCategory} yet</p>
              <Link href="/products">
                <Button variant="outline">Browse All Products</Button>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
