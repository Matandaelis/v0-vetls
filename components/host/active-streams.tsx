"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Eye, Share2, Square } from "lucide-react"

const mockStreams = [
  {
    id: 1,
    title: "Summer Fashion Collection Live Sale",
    startTime: new Date(),
    viewers: 2847,
    status: "live",
    products: 12,
  },
  {
    id: 2,
    title: "Tech Gadgets Demo & Giveaway",
    startTime: new Date(Date.now() + 3600000),
    viewers: 0,
    status: "scheduled",
    products: 8,
  },
  {
    id: 3,
    title: "Beauty Products Tutorial",
    startTime: new Date(Date.now() - 7200000),
    viewers: 0,
    status: "ended",
    products: 15,
  },
]

interface ActiveStreamsProps {
  onCreateShow: () => void
}

export function ActiveStreams({ onCreateShow }: ActiveStreamsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">My Shows</h3>
        <Button onClick={onCreateShow}>Create New Show</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockStreams.map((stream) => (
          <Card key={stream.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-lg">{stream.title}</h4>
                  <Badge
                    className={
                      stream.status === "live"
                        ? "bg-destructive"
                        : stream.status === "scheduled"
                          ? "bg-primary"
                          : "bg-secondary"
                    }
                  >
                    {stream.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>{format(stream.startTime, "MMM d, h:mm a")}</span>
                  {stream.viewers > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {stream.viewers.toLocaleString()} viewers
                    </span>
                  )}
                  <span>{stream.products} products</span>
                </div>
              </div>
              <div className="flex gap-2">
                {stream.status === "live" && (
                  <>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Square className="w-4 h-4" />
                      End
                    </Button>
                  </>
                )}
                {stream.status === "scheduled" && <Button size="sm">Go Live</Button>}
                {stream.status === "ended" && (
                  <Button variant="outline" size="sm">
                    View Replay
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
