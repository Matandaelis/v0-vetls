"use client"

import type { Show } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Heart } from "lucide-react"
import { format, isSameDay } from "date-fns"

interface ShowScheduleProps {
  shows: Show[]
  compact?: boolean
}

export function ShowSchedule({ shows, compact = false }: ShowScheduleProps) {
  // Group shows by date
  const groupedByDate = shows.reduce(
    (acc, show) => {
      const dateKey = format(show.startTime, "yyyy-MM-dd")
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(show)
      return acc
    },
    {} as Record<string, Show[]>,
  )

  const sortedDates = Object.keys(groupedByDate).sort()

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => {
        const date = new Date(dateKey)
        const showsForDate = groupedByDate[dateKey].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
        const isToday = isSameDay(date, new Date())

        return (
          <div key={dateKey}>
            {/* Date Header */}
            <div className="mb-4">
              <h3 className="text-lg font-bold">
                {format(date, "EEEE, MMMM d")}
                {isToday && <Badge className="ml-2 bg-destructive">TODAY</Badge>}
              </h3>
            </div>

            {/* Shows for this date */}
            <div className="space-y-3">
              {showsForDate.map((show) => (
                <Card key={show.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    {/* Show Image & Info */}
                    <div className="flex gap-4 flex-1 min-w-0">
                      <img
                        src={show.image || "/placeholder.svg"}
                        alt={show.title}
                        className="w-20 h-20 rounded object-cover flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold text-sm leading-tight flex-1">{show.title}</h4>
                          <Badge
                            className={
                              show.status === "live" ? "bg-destructive flex-shrink-0" : "bg-primary flex-shrink-0"
                            }
                          >
                            {show.status}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">{show.hostName}</p>

                        {/* Show Meta */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(show.startTime, "h:mm a")}
                          </div>
                          {show.viewerCount && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {show.viewerCount.toLocaleString()} viewers
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {show.products.length} products
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="whitespace-nowrap">
                        {show.status === "live" ? "Watch Live" : "Set Reminder"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
