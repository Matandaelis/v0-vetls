"use client"

import { Card } from "@/components/ui/card"
import type { HostMetrics } from "@/lib/types"

interface MetricsDisplayProps {
  metrics: HostMetrics
}

export function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="p-6">
        <p className="text-sm font-medium text-muted-foreground">Avg Watch Time</p>
        <p className="text-3xl font-bold mt-2">18 min</p>
        <p className="text-xs text-muted-foreground mt-1">Per viewer session</p>
      </Card>

      <Card className="p-6">
        <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
        <p className="text-3xl font-bold mt-2">45%</p>
        <p className="text-xs text-muted-foreground mt-1">Viewers who purchased</p>
      </Card>

      <Card className="p-6">
        <p className="text-sm font-medium text-muted-foreground">Top Product</p>
        <p className="text-xl font-bold mt-2 truncate">{metrics.topProduct}</p>
        <p className="text-xs text-muted-foreground mt-1">Best seller this month</p>
      </Card>

      <Card className="p-6">
        <p className="text-sm font-medium text-muted-foreground">Total Followers</p>
        <p className="text-3xl font-bold mt-2">{(metrics.totalViewers / 100).toFixed(0)}K</p>
        <p className="text-xs text-green-600 mt-1">+1200 this month</p>
      </Card>

      <Card className="p-6">
        <p className="text-sm font-medium text-muted-foreground">Avg Revenue per Show</p>
        <p className="text-3xl font-bold mt-2">${(metrics.totalRevenue / metrics.totalShows).toFixed(0)}</p>
        <p className="text-xs text-muted-foreground mt-1">Across all shows</p>
      </Card>

      <Card className="p-6">
        <p className="text-sm font-medium text-muted-foreground">Peak Viewers</p>
        <p className="text-3xl font-bold mt-2">{metrics.averageViewersPerShow}</p>
        <p className="text-xs text-muted-foreground mt-1">Max concurrent viewers</p>
      </Card>
    </div>
  )
}
