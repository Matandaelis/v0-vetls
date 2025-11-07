"use client"

import type { Show } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Users, TrendingUp, Calendar, Zap } from "lucide-react"

interface ShowStatsProps {
  shows: Show[]
}

export function ShowStats({ shows }: ShowStatsProps) {
  const liveShowsCount = shows.filter((s) => s.status === "live").length
  const totalViewers = shows.reduce((sum, s) => sum + (s.viewerCount || 0), 0)
  const upcomingCount = shows.filter((s) => s.status === "scheduled").length
  const totalProducts = shows.reduce((sum, s) => sum + s.products.length, 0)

  const stats = [
    {
      label: "Live Shows",
      value: liveShowsCount,
      icon: Zap,
      color: "text-destructive",
    },
    {
      label: "Total Viewers",
      value: totalViewers.toLocaleString(),
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Upcoming",
      value: upcomingCount,
      icon: Calendar,
      color: "text-purple-500",
    },
    {
      label: "Products",
      value: totalProducts,
      icon: TrendingUp,
      color: "text-green-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <Icon className={`w-8 h-8 ${stat.color} opacity-20`} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
