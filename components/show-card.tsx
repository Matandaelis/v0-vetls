import Link from "next/link"
import type { Show } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Eye } from "lucide-react"

interface ShowCardProps {
  show: Show
}

export function ShowCard({ show }: ShowCardProps) {
  const isLive = show.viewerCount !== undefined

  return (
    <Link href={`/shows/${show.id}`}>
      <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col bg-card border border-border">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-secondary aspect-video">
          <img 
            src={show.image || "/placeholder.svg"} 
            alt={show.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
          />
          
          {/* Badge */}
          <div className="absolute top-3 right-3">
            {isLive && (
              <Badge className="bg-accent text-accent-foreground font-semibold px-3 py-1 flex items-center gap-1 animate-pulse">
                <span className="w-2 h-2 bg-accent-foreground rounded-full"></span>
                LIVE
              </Badge>
            )}
            {show.featured && !isLive && (
              <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">
                Featured
              </Badge>
            )}
          </div>

          {/* Viewer Count - only for live shows */}
          {isLive && show.viewerCount && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium">
              <Eye className="w-4 h-4" />
              <span>{show.viewerCount.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-base line-clamp-2 mb-2 text-foreground hover:text-accent transition-colors">
            {show.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
            {show.description}
          </p>

          {/* Host Info */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={show.hostAvatar || "/placeholder.svg"}
              alt={show.hostName}
              className="w-8 h-8 rounded-full object-cover border border-border"
            />
            <div className="flex-grow">
              <p className="font-medium text-sm text-foreground">{show.hostName}</p>
              {!isLive && (
                <p className="text-xs text-muted-foreground">
                  {format(show.startTime, "MMM d, h:mm a")}
                </p>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            className="w-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 py-2"
            onClick={(e) => {
              e.preventDefault()
            }}
          >
            {isLive ? "Watch Now" : "Set Reminder"}
          </Button>
        </div>
      </Card>
    </Link>
  )
}
