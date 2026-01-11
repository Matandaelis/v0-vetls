"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthGuard } from "@/components/auth-guard"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Plus, TrendingUp, ShoppingBag, DollarSign, Eye } from "lucide-react"
import Link from "next/link"

interface SellerStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalViews: number
}

export default function SellerDashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [stats, setStats] = useState<SellerStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalViews: 0,
  })
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSellerData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: productsData } = await supabase.from("products").select("*").eq("seller_id", user.id)

      setProducts(productsData || [])

      if (productsData) {
        setStats({
          totalRevenue: productsData.reduce((sum: number, p: any) => sum + (p.total_sold || 0), 0),
          totalOrders: productsData.reduce((sum: number, p: any) => sum + (p.orders_count || 0), 0),
          totalProducts: productsData.length,
          totalViews: productsData.reduce((sum: number, p: any) => sum + (p.views || 0), 0),
        })
      }

      setIsLoading(false)
    }

    fetchSellerData()
  }, [supabase])

  return (
    <AuthGuard requiredRole="seller">
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Seller Dashboard</h1>
              <p className="text-muted-foreground">Manage your products and sales</p>
            </div>
            <Link href="/seller/products/new">
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                New Product
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Revenue</p>
                  <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Orders</p>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Products</p>
                  <p className="text-3xl font-bold">{stats.totalProducts}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Views</p>
                  <p className="text-3xl font-bold">{stats.totalViews}</p>
                </div>
                <Eye className="w-8 h-8 text-primary" />
              </div>
            </Card>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : products.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No products yet</p>
                  <Link href="/seller/products/new">
                    <Button>Create First Product</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-2xl font-bold text-primary mt-2">${product.price.toFixed(2)}</p>
                        <div className="flex gap-2 mt-4">
                          <Link href={`/seller/products/${product.id}/edit`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              Edit
                            </Button>
                          </Link>
                          <Button variant="destructive" size="sm" className="flex-1">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders">
              <Card className="p-6">
                <p className="text-muted-foreground">Order management coming soon</p>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="p-6">
                <p className="text-muted-foreground">Analytics coming soon</p>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="p-6">
                <p className="text-muted-foreground">Settings coming soon</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
