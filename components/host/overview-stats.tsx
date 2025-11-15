"use client"

import { Card } from "@/components/ui/card"
import { Zap, Users, TrendingUp, DollarSign } from 'lucide-react'

export function HostOverviewStats() {
  const stats = [
    {
      label: "Total Revenue",
      value: "$12,450",
      change: "+12.5%",
      icon: DollarSign,
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: "Active Viewers",
      value: "2,847",
      change: "+8.2%",
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Conversion Rate",
      value: "12.4%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      label: "Live Shows",
      value: "3",
      change: "Today",
      icon: Zap,
      color: "bg-red-500/10 text-red-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
