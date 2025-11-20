"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useProducts } from "@/contexts/product-context"
import { Button } from "@/components/ui/button"
import { ArrowRight, Laptop, Shirt, Sparkles, Home, Monitor } from "lucide-react"

export default function CategoriesPage() {
  const { getCategories, getProductsByCategory } = useProducts()
  const categories = getCategories()

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Electronics":
        return <Laptop className="w-8 h-8" />
      case "Fashion":
        return <Shirt className="w-8 h-8" />
      case "Beauty":
        return <Sparkles className="w-8 h-8" />
      case "Home":
        return <Home className="w-8 h-8" />
      case "Technology":
        return <Monitor className="w-8 h-8" />
      default:
        return <Sparkles className="w-8 h-8" />
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Electronics: "from-blue-500 to-blue-600",
      Fashion: "from-purple-500 to-purple-600",
      Beauty: "from-pink-500 to-pink-600",
      Home: "from-amber-500 to-amber-600",
      Technology: "from-cyan-500 to-cyan-600",
    }
    return colors[category] || "from-gray-500 to-gray-600"
  }

  const getCategoryDescription = (category: string) => {
    const descriptions: Record<string, string> = {
      Electronics: "Discover the latest gadgets and devices.",
      Fashion: "Explore trending styles and collections.",
      Beauty: "Find premium skincare and makeup products.",
      Home: "Upgrade your living space with essentials.",
      Technology: "Professional gear and tech setups.",
    }
    return descriptions[category] || "Explore our collection."
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary/30 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Categories</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of products and live shows across different categories. Find exactly what you're
              looking for.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const productCount = getProductsByCategory(category).length

                return (
                  <Link key={category} href={`/category/${category.toLowerCase()}`} className="group block">
                    <div className="border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col bg-card">
                      <div
                        className={`h-32 bg-gradient-to-r ${getCategoryColor(category)} flex items-center justify-center text-white`}
                      >
                        <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300">
                          {getCategoryIcon(category)}
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold">{category}</h3>
                          <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-full">
                            {productCount} Products
                          </span>
                        </div>
                        <p className="text-muted-foreground mb-6 flex-1">{getCategoryDescription(category)}</p>
                        <Button
                          variant="outline"
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                        >
                          Browse {category} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
