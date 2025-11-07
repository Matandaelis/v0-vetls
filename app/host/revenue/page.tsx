"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { useAnalytics } from "@/contexts/analytics-context"
import { ArrowLeft, Download, TrendingUp } from "lucide-react"

export default function RevenuePage() {
  const { getHostMetrics, getRevenueReport, productAnalytics } = useAnalytics()

  const hostMetrics = getHostMetrics("host-1")
  const dailyReport = getRevenueReport("host-1", "daily")
  const weeklyReport = getRevenueReport("host-1", "weekly")
  const monthlyReport = getRevenueReport("host-1", "monthly")

  if (!hostMetrics) {
    return <div>Loading...</div>
  }

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
              <h1 className="text-4xl font-bold">Revenue & Payouts</h1>
              <p className="text-muted-foreground mt-1">Track earnings and generate financial reports</p>
            </div>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <Badge>This Month</Badge>
            </div>
            <p className="text-4xl font-bold">${monthlyReport.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-2">+12% from last month</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <Badge variant="outline">This Month</Badge>
            </div>
            <p className="text-4xl font-bold">{monthlyReport.totalOrders}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Average value: ${monthlyReport.averageOrderValue.toFixed(2)}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Available Payout</p>
              <Badge variant="secondary">Next Cycle</Badge>
            </div>
            <p className="text-4xl font-bold text-green-600">${(monthlyReport.totalRevenue * 0.8).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-2">After 20% platform fee</p>
          </Card>
        </div>

        {/* Detailed Reports */}
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          {/* Daily Report */}
          <TabsContent value="daily" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6">Daily Revenue Report</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="font-medium">Today</p>
                    <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
                  </div>
                  <p className="text-lg font-bold">${(dailyReport.totalRevenue / 30).toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="font-medium">Yesterday</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(Date.now() - 86400000).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-lg font-bold">${(dailyReport.totalRevenue / 30).toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two Days Ago</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(Date.now() - 172800000).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-lg font-bold">${(dailyReport.totalRevenue / 30).toFixed(2)}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Weekly Report */}
          <TabsContent value="weekly" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6">Weekly Revenue Report</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">This Week</p>
                    <p className="text-sm text-muted-foreground">Nov 1 - Nov 7</p>
                  </div>
                  <p className="text-lg font-bold">${weeklyReport.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Last Week</p>
                    <p className="text-sm text-muted-foreground">Oct 25 - Oct 31</p>
                  </div>
                  <p className="text-lg font-bold">${(weeklyReport.totalRevenue * 0.95).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Monthly Report */}
          <TabsContent value="monthly" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6">Monthly Revenue Report</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <div>
                    <p className="font-medium text-green-900">November 2024</p>
                    <p className="text-sm text-green-700">Current month</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">${monthlyReport.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">October 2024</p>
                    <p className="text-sm text-muted-foreground">Previous month</p>
                  </div>
                  <p className="text-lg font-bold">${(monthlyReport.totalRevenue * 0.88).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Top Products by Revenue */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Products by Revenue
          </h3>
          <div className="space-y-4">
            {productAnalytics.slice(0, 5).map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.purchases} sales</p>
                  </div>
                </div>
                <p className="text-lg font-bold">${product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
