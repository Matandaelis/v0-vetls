"use client"

import { useSocial } from "@/contexts/social-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { FollowButton } from "@/components/follow-button"
import { useParams } from "next/navigation"
import { Mail, Share2 } from "lucide-react"
import { useSearch } from "@/contexts/search-context"
import { ProductCard } from "@/components/product-card"
import { useEffect, useState } from "react"
import type { Product } from "@/lib/types"

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const { getUserById } = useSocial()
  const user = getUserById(userId)
  const { searchProducts } = useSearch()

  const [userProducts, setUserProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const results = await searchProducts({ sellerId: userId })
      setUserProducts(results)
      setLoading(false)
    }
    fetchProducts()
  }, [userId, searchProducts])

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Profile Header */}
      <section className="bg-gradient-to-r from-primary/20 to-primary/5 py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <img
              src={user.avatar || "/placeholder.svg"}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
              <p className="text-muted-foreground mb-4">{user.bio}</p>
              <div className="flex gap-6 mb-6">
                <div>
                  <p className="text-2xl font-bold">{user.followers}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.following}</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{userProducts.length}</p>
                  <p className="text-sm text-muted-foreground">Products</p>
                </div>
              </div>
              <div className="flex gap-2">
                <FollowButton userId={userId} />
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Mail className="w-4 h-4" />
                  Message
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      {loading ? (
        <section className="py-12 md:py-16 text-center">
          <p className="text-muted-foreground">Loading products...</p>
        </section>
      ) : userProducts.length > 0 ? (
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Products</h2>
                <p className="text-muted-foreground">Explore {user.name}'s products</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {userProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-muted-foreground mb-4">No products yet</p>
            <p className="text-sm text-muted-foreground">Check back later for new products from {user.name}</p>
          </div>
        </section>
      )}
    </div>
  )
}
