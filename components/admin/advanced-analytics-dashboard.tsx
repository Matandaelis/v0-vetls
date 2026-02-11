"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, DollarSign, TrendingUp, Activity, 
  ShoppingCart, Video, Award, Zap 
} from "lucide-react"
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts"

interface AdvancedAnalyticsDashboardProps {
  className?: string
}

export function AdvancedAnalyticsDashboard({ className }: AdvancedAnalyticsDashboardProps) {
  const [period, setPeriod] = useState("30")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics/advanced?period=${period}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive platform insights and metrics</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.overview.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${data.overview.avgOrderValue.toFixed(2)} avg order value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              of {data.overview.totalUsers.toLocaleString()} total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.conversionRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.overview.totalOrders.toLocaleString()} orders placed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.performance.cacheHitRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.performance.apiLatency.toFixed(0)}ms avg latency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="shows">Shows</TabsTrigger>
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Daily revenue over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.timeSeries.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    name="Revenue ($)" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Orders Trend</CardTitle>
                <CardDescription>Daily orders over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.timeSeries.orders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
                <CardDescription>Key revenue indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="text-lg font-bold">
                    ${data.overview.totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg Order Value</span>
                  <span className="text-lg font-bold">
                    ${data.overview.avgOrderValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Orders</span>
                  <span className="text-lg font-bold">
                    {data.overview.totalOrders.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.timeSeries.users}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      name="New Users" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Active vs total users</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: data.overview.activeUsers },
                        { name: 'Inactive', value: data.overview.totalUsers - data.overview.activeUsers }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best selling products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topProducts.map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.unitsSold} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${product.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shows Tab */}
        <TabsContent value="shows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Live Shows</CardTitle>
              <CardDescription>Most viewed shows by audience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topShows.map((show: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Video className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{show.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {show.viewerCount.toLocaleString()} viewers • {show.engagementRate.toFixed(1)}% engagement
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${show.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sellers Tab */}
        <TabsContent value="sellers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Sellers</CardTitle>
              <CardDescription>Highest performing sellers by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topSellers.map((seller: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                        {seller.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{seller.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {seller.totalOrders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${seller.totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
