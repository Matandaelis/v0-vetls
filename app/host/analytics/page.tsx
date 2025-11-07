"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { useAnalytics } from "@/contexts/analytics-context"
import { ViewerTrendChart, RevenueChart, ProductPerformanceChart } from "@/components/analytics-chart"
import { MetricsDisplay } from "@/components/analytics-metrics"
import { ArrowLeft } from "lucide-react"

export default function AnalyticsPage() {
  const { getHostMetrics, analyticsData, productAnalytics } = useAnalytics()

  const hostMetrics = getHostMetrics("host-1")

  if (!hostMetrics) {
    return <div>Loading...</div>
  }

  // Transform data for charts
  const viewerTrendData = [
    { name: "Nov 1", viewers: 2500, engagement: 45 },
    { name: "Nov 2", viewers: 1800, engagement: 38 },
    { name: "Nov 3", viewers: 3200, engagement: 52 },
    { name: "Nov 4", viewers: 2100, engagement: 41 },
    { name: "Nov 5", viewers: 2800, engagement: 48 },
  ]

  const revenueData = [
    { name: "Show 1", revenue: 3200, orders: 32 },
    { name: "Show 2", revenue: 2100, orders: 21 },
    { name: "Show 3", revenue: 4500, orders: 45 },
  ]

  const productData = productAnalytics.map((p) => ({
    name: p.name,
    sales: p.purchases,
  }))

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
          <h1 className="text-4xl font-bold">Detailed Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive performance metrics and insights</p>
        </div>

        {/* Metrics Overview */}
        <div className="mb-8">
          <MetricsDisplay metrics={hostMetrics} />
        </div>

        {/* Charts */}
        <Tabs defaultValue="viewers" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="viewers">Viewers</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          {/* Viewer Trends */}
          <TabsContent value="viewers" className="mt-6">
            <ViewerTrendChart data={viewerTrendData} />
          </TabsContent>

          {/* Revenue */}
          <TabsContent value="revenue" className="mt-6">
            <RevenueChart data={revenueData} />
          </TabsContent>

          {/* Products */}
          <TabsContent value="products" className="mt-6">
            <ProductPerformanceChart data={productData} />
          </TabsContent>
        </Tabs>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Key Insights</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                Peak viewers reached {hostMetrics.averageViewersPerShow * 1.5} on Nov 3
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full" />
                {hostMetrics.topProduct} is your best performer
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full" />
                Conversion rate improved by 2% this month
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-600 rounded-full" />
                Average watch time is 18 minutes per session
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Top Performing Shows</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="font-medium text-sm">Gaming Tech Gadgets Show</span>
                <span className="text-green-600 font-bold">$4,500</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="font-medium text-sm">Fashion & Style Live</span>
                <span className="text-green-600 font-bold">$3,200</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Beauty Expert Series</span>
                <span className="text-green-600 font-bold">$2,100</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
