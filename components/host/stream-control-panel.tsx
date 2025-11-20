"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Radio, Square, Volume2, Share2, Settings, Users, Clock, Activity } from "lucide-react"
import { LiveKitRoom, useLocalParticipant, VideoTrack, ControlBar, Track } from "@livekit/components-react"
import "@livekit/components-styles"

export function StreamControlPanel() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [roomName, setRoomName] = useState("")
  const [token, setToken] = useState<string>("")
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isStreaming) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } else {
      setDuration(0)
    }
    return () => clearInterval(interval)
  }, [isStreaming])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startStream = async () => {
    if (!roomName) {
      alert("Please enter a room name")
      return
    }

    try {
      const response = await fetch(
        `/api/livekit/token?room=${encodeURIComponent(roomName)}&username=host-${Math.floor(Math.random() * 1000)}&canPublish=true`,
      )
      const data = await response.json()

      if (!data.token) {
        throw new Error("Failed to get token")
      }

      setToken(data.token)
      setIsStreaming(true)
    } catch (error) {
      console.error("[v0] Error starting stream:", error)
      alert("Failed to start stream. Please check your LiveKit configuration.")
    }
  }

  const stopStream = async () => {
    setToken("")
    setIsStreaming(false)
    setDuration(0)
  }

  if (isStreaming && token) {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Stream Control</h3>
            <Badge className="bg-destructive animate-pulse">LIVE</Badge>
          </div>

          <div className="bg-black rounded-lg aspect-video overflow-hidden">
            <LiveKitRoom
              video={true}
              audio={true}
              token={token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              data-lk-theme="default"
              connect={true}
              style={{ height: "100%" }}
            >
              <BroadcastView />
            </LiveKitRoom>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                Viewers
              </p>
              <p className="text-xl font-bold">-</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Duration
              </p>
              <p className="text-xl font-bold">{formatDuration(duration)}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Status
              </p>
              <p className="text-xl font-bold text-green-500">Live</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={stopStream} className="flex-1 gap-2 bg-destructive hover:bg-destructive/90">
              <Square className="w-4 h-4" />
              Stop Stream
            </Button>
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

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Stream Control</h3>
            <Badge className="bg-secondary">OFFLINE</Badge>
          </div>

          <div className="mb-4 p-4 bg-secondary/20 rounded-lg border border-border">
            <div className="grid gap-2">
              <Label htmlFor="room-name">Room Name (Show ID)</Label>
              <div className="flex gap-2">
                <Input
                  id="room-name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name (e.g. 1 for first show)"
                />
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the ID that matches your show page. Viewers will connect to this room to watch your stream.
              </p>
            </div>
          </div>

          <div className="bg-muted rounded-lg aspect-video flex items-center justify-center border-2 border-dashed border-border">
            <div className="text-center">
              <Radio className="w-12 h-12 mx-auto text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">Ready to go live?</p>
              <p className="text-xs text-muted-foreground mt-1">Your camera will activate when you start streaming</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Viewers</p>
            <p className="text-xl font-bold">0</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-xl font-bold">00:00</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-xl font-bold text-gray-400">Offline</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={startStream} className="flex-1 gap-2">
            <Radio className="w-4 h-4" />
            Go Live
          </Button>
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

function BroadcastView() {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant()

  return (
    <div className="relative h-full w-full bg-gray-900">
      {localParticipant && localParticipant.videoTrackPublications.size > 0 && (
        <VideoTrack
          trackRef={{
            participant: localParticipant,
            source: Track.Source.Camera,
          }}
          className="w-full h-full object-cover"
        />
      )}

      {/* Built-in LiveKit Control Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <ControlBar variation="minimal" controls={{ camera: true, microphone: true, screenShare: false }} />
      </div>

      {/* Status indicators */}
      <div className="absolute top-4 left-4 flex gap-2">
        <Badge variant={isCameraEnabled ? "default" : "destructive"} className="text-xs">
          {isCameraEnabled ? "Camera On" : "Camera Off"}
        </Badge>
        <Badge variant={isMicrophoneEnabled ? "default" : "destructive"} className="text-xs">
          {isMicrophoneEnabled ? "Mic On" : "Mic Off"}
        </Badge>
      </div>
    </div>
  )
}
