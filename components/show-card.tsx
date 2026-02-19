import Link from "next/link"
import Image from "next/image"
import type { Show } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface ShowCardProps {
  show: Show
}

export function ShowCard({ show }: ShowCardProps) {
  const isLive = show.viewerCount !== undefined

  return (
    <Link href={`/shows/${show.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="relative w-full h-48">
          <Image
            src={show.image || "/placeholder.svg"}
            alt={show.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isLive && <Badge className="absolute top-2 right-2 bg-destructive">LIVE</Badge>}
          {show.featured && !isLive && <Badge className="absolute top-2 right-2 bg-primary">Featured</Badge>}
        </div>
        <div className="p-4">
          <h3 className="font-semibold line-clamp-2 mb-2">{show.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{show.description}</p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Image
                src={show.hostAvatar || "/placeholder.svg"}
                alt={show.hostName}
                width={24}
                height={24}
                className="rounded-full object-cover"
              />
              <span className="font-medium">{show.hostName}</span>
            </div>
            {show.viewerCount && (
              <span className="text-muted-foreground">{show.viewerCount.toLocaleString()} viewers</span>
            )}
          </div>
          {!isLive && <p className="text-xs text-muted-foreground mt-2">{format(show.startTime, "MMM d, h:mm a")}</p>}
        </div>
      </Card>
    </Link>
  )
}
