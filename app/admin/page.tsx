"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Video, DollarSign, Activity, AlertTriangle } from 'lucide-react'
import { mockUsers, mockShows } from "@/lib/mock-data"

export default function AdminDashboard() {
  const totalUsers = mockUsers.length + 1240 // Simulated total
  const activeStreams = mockShows.filter(s => s.status === "live").length
  const totalRevenue = 154230.50
  const pendingReports = 12

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground">Global statistics and system health.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+180 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStreams}</div>
            <p className="text-xs text-muted-foreground">Peak: 24 concurrent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{pendingReports}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <Activity className="h-9 w-9 text-primary mr-4" />
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Server Load Spike</p>
                  <p className="text-sm text-muted-foreground">
                    Ant Media Server cluster 2 reached 85% capacity
                  </p>
                </div>
                <div className="ml-auto font-medium">2m ago</div>
              </div>
              <div className="flex items-center">
                <Users className="h-9 w-9 text-primary mr-4" />
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">New Seller Registration</p>
                  <p className="text-sm text-muted-foreground">
                    TechStore Official applied for seller status
                  </p>
                </div>
                <div className="ml-auto font-medium">15m ago</div>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="h-9 w-9 text-destructive mr-4" />
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Stream Reported</p>
                  <p className="text-sm text-muted-foreground">
                    User report on "Late Night Gaming" for inappropriate content
                  </p>
                </div>
                <div className="ml-auto font-medium">1h ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Latency</span>
                <span className="text-sm text-green-500">45ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stream Health</span>
                <span className="text-sm text-green-500">98.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Load</span>
                <span className="text-sm text-yellow-500">62%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm text-green-500">41%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
