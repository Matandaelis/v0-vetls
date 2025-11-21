"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Radio, Volume2, Share2 } from "lucide-react"
import { LiveKitBroadcaster } from "@/components/livekit-broadcaster"

export function StreamControlPanel() {
  const [isStreaming, setIsStreaming] = useState(false)

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Stream Control</h3>
            <Badge className={isStreaming ? "bg-destructive" : "bg-secondary"}>
              {isStreaming ? "LIVE" : "OFFLINE"}
            </Badge>
          </div>
          <div className="bg-muted rounded-lg aspect-video flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
            {isStreaming ? (
              <LiveKitBroadcaster roomName="demo-room" username="Host" onLeave={() => setIsStreaming(false)} />
            ) : (
              <div className="text-center">
                <Radio className="w-12 h-12 mx-auto text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">Stream Preview</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Viewers</p>
            <p className="text-xl font-bold">1,245</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-xl font-bold">14:32</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Bitrate</p>
            <p className="text-xl font-bold">4.5 Mbps</p>
          </div>
        </div>

        <div className="flex gap-3">
          {!isStreaming && (
            <Button onClick={() => setIsStreaming(true)} className="flex-1 gap-2">
              <Radio className="w-4 h-4" />
              Go Live
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
