"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { ShowStats } from "@/components/show-stats"
import { ShowSchedule } from "@/components/show-schedule"
import { useShows } from "@/contexts/show-context"
import { ArrowRight, Calendar } from "lucide-react"

export default function DashboardPage() {
  const { shows, getLiveShows, getUpcomingShows, getShowsByStatus } = useShows()

  const liveShows = getLiveShows()
  const upcomingShows = getUpcomingShows()
  const endedShows = getShowsByStatus("ended")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold">Shows Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage and track all live shopping shows</p>
            </div>
            <Link href="/shows">
              <Button className="gap-2">
                View All Shows <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <ShowStats shows={shows} />

        {/* Schedule and Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All Shows</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>

          {/* All Shows */}
          <TabsContent value="all" className="mt-6">
            <Card className="p-6">
              <ShowSchedule shows={shows} />
            </Card>
          </TabsContent>

          {/* Live Shows */}
          <TabsContent value="live" className="mt-6">
            <Card className="p-6">
              {liveShows.length > 0 ? (
                <ShowSchedule shows={liveShows} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No live shows at the moment</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Upcoming Shows */}
          <TabsContent value="upcoming" className="mt-6">
            <Card className="p-6">
              {upcomingShows.length > 0 ? (
                <ShowSchedule shows={upcomingShows} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming shows scheduled</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Quick Links */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/shows">
                <Button variant="ghost" className="w-full justify-start">
                  Browse All Shows
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="ghost" className="w-full justify-start">
                  View Products
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="ghost" className="w-full justify-start">
                  Shopping Cart
                </Button>
              </Link>
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Events
            </h3>
            {upcomingShows.length > 0 ? (
              <div className="space-y-2">
                {upcomingShows.slice(0, 3).map((show) => (
                  <Link key={show.id} href={`/shows/${show.id}`}>
                    <Button variant="ghost" className="w-full justify-start text-left h-auto p-2">
                      <div className="text-sm">
                        <p className="font-medium">{show.title}</p>
                        <p className="text-xs text-muted-foreground">{show.hostName}</p>
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No shows today</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
