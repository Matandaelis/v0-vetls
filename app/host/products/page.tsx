"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { useProducts } from "@/contexts/product-context"
import { useAnalytics } from "@/contexts/analytics-context"
import { ArrowLeft, Plus, TrendingUp } from "lucide-react"

export default function HostProductsPage() {
  const { products } = useProducts()
  const { productAnalytics } = useAnalytics()

  // Filter products sold by current host
  const hostProducts = products.filter((p) => p.sellerId === "host-1")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/host">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Product Inventory</h1>
              <p className="text-muted-foreground mt-1">Manage and track your products</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostProducts.map((product) => {
            const analytics = productAnalytics.find((p) => p.productId === product.id)
            return (
              <Card key={product.id} className="overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  <p className="text-2xl font-bold text-green-600 mb-3">${product.price}</p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Stock</span>
                      <Badge variant={product.stock > 10 ? "default" : "destructive"}>{product.stock} units</Badge>
                    </div>
                    {analytics && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Sales</span>
                          <span className="font-medium">{analytics.purchases}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Revenue</span>
                          <span className="font-bold text-green-600">${analytics.revenue}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <TrendingUp className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {hostProducts.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No products yet</p>
            <Button>Add Your First Product</Button>
          </Card>
        )}
      </div>
    </div>
  )
}
