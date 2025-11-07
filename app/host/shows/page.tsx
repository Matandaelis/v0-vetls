"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { useShows } from "@/contexts/show-context"
import { ArrowLeft, Plus, Edit2, Trash2, Eye } from "lucide-react"

export default function HostShowsPage() {
  const { shows } = useShows()

  // Filter shows by current host (simulating host-1)
  const hostShows = shows.filter((s) => s.hostId === "host-1")

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
              <h1 className="text-4xl font-bold">Your Shows</h1>
              <p className="text-muted-foreground mt-1">Manage and track your live shopping shows</p>
            </div>
            <Link href="/host/shows/create">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Show
              </Button>
            </Link>
          </div>
        </div>

        {/* Shows List */}
        <div className="space-y-4">
          {hostShows.length > 0 ? (
            hostShows.map((show) => (
              <Card key={show.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{show.title}</h3>
                      <Badge
                        variant={
                          show.status === "live" ? "default" : show.status === "scheduled" ? "secondary" : "outline"
                        }
                      >
                        {show.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{show.description}</p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {show.viewerCount || 0} viewers
                      </span>
                      <span>{new Date(show.startTime).toLocaleString()}</span>
                      <span className="capitalize">{show.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/shows/${show.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">You haven't created any shows yet</p>
              <Link href="/host/shows/create">
                <Button>Create Your First Show</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
