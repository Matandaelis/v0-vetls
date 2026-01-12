"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Video, DollarSign, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStreams: 0,
    totalRevenue: 0,
    pendingReports: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)

        // Get total users
        const { count: usersCount, error: usersError } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })

        // Get active streams
        const { data: showsData, error: showsError } = await supabase.from("shows").select("*").eq("status", "live")

        // Get total revenue from orders
        const { data: ordersData, error: ordersError } = await supabase.from("orders").select("total_amount")

        if (usersError) console.error("[v0] Users error:", usersError)
        if (showsError) console.error("[v0] Shows error:", showsError)
        if (ordersError) console.error("[v0] Orders error:", ordersError)

        const totalRevenue = (ordersData || []).reduce((sum, order) => sum + (order.total_amount || 0), 0)

        setStats({
          totalUsers: usersCount || 0,
          activeStreams: showsData?.length || 0,
          totalRevenue,
          pendingReports: 12, // This would come from a reports table
        })
      } catch (error) {
        console.error("[v0] Error loading admin stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
      </div>
    )
  }

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
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+180 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStreams}</div>
            <p className="text-xs text-muted-foreground">Peak: 24 concurrent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">5 urgent</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
