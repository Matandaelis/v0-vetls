"use client"

import { useState } from "react"
import type { Show } from "@/lib/types"
import { useShows } from "@/contexts/show-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check } from 'lucide-react'

interface StreamSetupModalProps {
  show: Show
  isOpen: boolean
  onClose: () => void
}

export function StreamSetupModal({ show, isOpen, onClose }: StreamSetupModalProps) {
  const { initializeShow } = useShows()
  const [isInitializing, setIsInitializing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleInitialize = async () => {
    try {
      setIsInitializing(true)
      await initializeShow(show.id)
      setTimeout(onClose, 500)
    } catch (error) {
      console.error("[v0] Error initializing stream:", error)
    } finally {
      setIsInitializing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Stream Setup - {show.title}</DialogTitle>
          <DialogDescription>
            Configure your streaming settings with Ant Media StreamApp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stream Status */}
          <Card className="p-4 bg-secondary/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Stream Status</p>
                <p className="text-xs text-muted-foreground mt-1">Ready to broadcast</p>
              </div>
              <Badge className={show.status === "live" ? "bg-destructive" : "bg-primary"}>
                {show.status.toUpperCase()}
              </Badge>
            </div>
          </Card>

          {/* RTMP Information */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold mb-2">RTMP URL (for OBS/Streamlabs)</p>
              <Card className="p-3 flex items-center justify-between bg-muted">
                <code className="text-xs font-mono truncate">{show.rtmpUrl}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(show.rtmpUrl || "")}
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </Card>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Stream ID</p>
              <Card className="p-3 flex items-center justify-between bg-muted">
                <code className="text-xs font-mono truncate">{show.streamId}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(show.streamId || "")}
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </Card>
            </div>
          </div>

          {/* Stream Quality Info */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Recommended Settings</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• <strong>Resolution:</strong> 1920x1080 (1080p) or 1280x720 (720p)</li>
              <li>• <strong>Bitrate:</strong> 4500-6000 kbps</li>
              <li>• <strong>FPS:</strong> 30 or 60</li>
              <li>• <strong>Encoder:</strong> H.264</li>
              <li>• <strong>Audio Bitrate:</strong> 128-192 kbps</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleInitialize} disabled={isInitializing} className="flex-1">
              {isInitializing ? "Initializing..." : "Start Streaming"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
