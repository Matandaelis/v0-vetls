"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { useAnalytics } from "@/contexts/analytics-context"
import { useShows } from "@/contexts/show-context"
import { ArrowRight, TrendingUp, Eye, DollarSign, Users } from "lucide-react"

export default function HostDashboard() {
  const { getHostMetrics, getRevenueReport } = useAnalytics()
  const { getLiveShows, getUpcomingShows } = useShows()

  const hostMetrics = getHostMetrics("host-1")
  const revenueReport = getRevenueReport("host-1", "monthly")
  const liveShows = getLiveShows()
  const upcomingShows = getUpcomingShows()

  if (!hostMetrics) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold">Host Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your live shows and track performance</p>
            </div>
            <Link href="/host/shows">
              <Button className="gap-2">
                Manage Shows <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">${hostMetrics.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          {/* Total Viewers */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Viewers</p>
                <p className="text-3xl font-bold mt-2">{hostMetrics.totalViewers.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">Avg {hostMetrics.averageViewersPerShow} per show</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          {/* Total Shows */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Shows</p>
                <p className="text-3xl font-bold mt-2">{hostMetrics.totalShows}</p>
                <p className="text-xs text-purple-600 mt-1">{liveShows.length} live now</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          {/* Conversion Rate */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold mt-2">{(hostMetrics.conversionRate * 100).toFixed(1)}%</p>
                <p className="text-xs text-orange-600 mt-1">+2% improvement</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shows">Shows</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Shows */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Recent Shows</h3>
                <div className="space-y-3">
                  {upcomingShows.slice(0, 3).map((show) => (
                    <div key={show.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{show.title}</p>
                        <p className="text-xs text-muted-foreground">{show.category}</p>
                      </div>
                      <Badge variant={show.status === "live" ? "default" : "secondary"}>{show.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Top Product */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Top Performing Product</h3>
                <div className="text-center py-4">
                  <p className="text-2xl font-bold text-green-600">{hostMetrics.topProduct}</p>
                  <p className="text-sm text-muted-foreground mt-2">Featured in latest shows</p>
                  <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                    <Link href="/host/products">View Products</Link>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Revenue Overview */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Monthly Revenue</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Sales</span>
                  <span className="text-lg font-bold">${revenueReport.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Orders</span>
                  <span className="text-lg font-bold">{revenueReport.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg Order Value</span>
                  <span className="text-lg font-bold">${revenueReport.averageOrderValue.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Shows Tab */}
          <TabsContent value="shows" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Your Shows</h3>
                <Link href="/host/shows/create">
                  <Button size="sm">Create New Show</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingShows.map((show) => (
                  <div key={show.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{show.title}</p>
                      <p className="text-sm text-muted-foreground">{new Date(show.startTime).toLocaleString()}</p>
                    </div>
                    <Badge>{show.status}</Badge>
                    <Link href={`/shows/${show.id}`}>
                      <Button variant="outline" size="sm" className="ml-4 bg-transparent">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6">Performance Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Shows Completed</p>
                  <p className="text-4xl font-bold">{hostMetrics.totalShows}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Total Revenue Generated</p>
                  <p className="text-4xl font-bold">${hostMetrics.totalRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Avg Viewers per Show</p>
                  <p className="text-4xl font-bold">{hostMetrics.averageViewersPerShow}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Customer Conversion Rate</p>
                  <p className="text-4xl font-bold">{(hostMetrics.conversionRate * 100).toFixed(1)}%</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6 bg-transparent" asChild>
                <Link href="/host/analytics">View Detailed Analytics</Link>
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
