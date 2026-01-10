"use client"

import { useEffect, useState } from "react"
import {
  LiveKitRoom,
  VideoTrack,
  useTracks,
  useLocalParticipant,
  useRoomContext,
  useConnectionState,
} from "@livekit/components-react"
import { Track, ConnectionState, RoomEvent } from "livekit-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Video, VideoOff, Square } from "lucide-react"
import "@livekit/components-styles"

interface LiveKitBroadcasterProps {
  roomName: string
  username: string
  onLeave?: () => void
  onMetricsUpdate?: (metrics: any) => void
}

export function LiveKitBroadcaster({ roomName, username, onLeave, onMetricsUpdate }: LiveKitBroadcasterProps) {
  const [token, setToken] = useState("")

  useEffect(() => {
    ;(async () => {
      try {
        const resp = await fetch(`/api/livekit/token?room=${roomName}&username=${username}&admin=true`)
        const data = await resp.json()
        setToken(data.token)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [roomName, username])

  if (token === "") {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100%" }}
      onDisconnected={onLeave}
    >
      <BroadcasterControls onLeave={onLeave} onMetricsUpdate={onMetricsUpdate} />
    </LiveKitRoom>
  )
}

function BroadcasterControls({
  onLeave,
  onMetricsUpdate,
}: { onLeave?: () => void; onMetricsUpdate?: (metrics: any) => void }) {
  const { localParticipant } = useLocalParticipant()
  const room = useRoomContext()
  const connectionState = useConnectionState()
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [metrics, setMetrics] = useState({
    ingressBitrate: 0,
    egressBitrate: 0,
    ingressPackets: 0,
    egressPackets: 0,
  })

  useEffect(() => {
    if (!room) return

    const handleStatsUpdate = () => {
      // This will be populated with actual LiveKit stats in production
      const stats = {
        ingressBitrate: Math.random() * 8000 + 2000,
        egressBitrate: Math.random() * 6000 + 1500,
        ingressPackets: Math.floor(Math.random() * 10000),
        egressPackets: Math.floor(Math.random() * 10000),
      }
      setMetrics(stats)
      onMetricsUpdate?.(stats)
    }

    const interval = setInterval(handleStatsUpdate, 1000)
    room.on(RoomEvent.Disconnected, () => clearInterval(interval))

    return () => clearInterval(interval)
  }, [room, onMetricsUpdate])

  const toggleCamera = async () => {
    if (localParticipant) {
      const enabled = !isCameraEnabled
      await localParticipant.setCameraEnabled(enabled)
      setIsCameraEnabled(enabled)
    }
  }

  const toggleMic = async () => {
    if (localParticipant) {
      const enabled = !isMicEnabled
      await localParticipant.setMicrophoneEnabled(enabled)
      setIsMicEnabled(enabled)
    }
  }

  const handleLeave = async () => {
    if (room) {
      await room.disconnect()
    }
    onLeave?.()
  }

  const isConnected = connectionState === ConnectionState.Connected

  return (
    <div className="relative h-full w-full bg-black rounded-lg overflow-hidden group">
      <div className="absolute inset-0">
        <VideoPreview />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <Badge variant="destructive" className="animate-pulse">
          LIVE
        </Badge>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isMicEnabled ? "secondary" : "destructive"}
            size="icon"
            onClick={toggleMic}
            className="rounded-full"
          >
            {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <Button
            variant={isCameraEnabled ? "secondary" : "destructive"}
            size="icon"
            onClick={toggleCamera}
            className="rounded-full"
          >
            {isCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button variant="destructive" onClick={handleLeave} className="gap-2 rounded-full px-6">
            <Square className="w-4 h-4" />
            End Stream
          </Button>
        </div>
      </div>
    </div>
  )
}

function VideoPreview() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone])

  const cameraTrack = tracks.find((t) => t.source === Track.Source.Camera)

  if (!cameraTrack) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <p>Camera is off</p>
      </div>
    )
  }

  return <VideoTrack trackRef={cameraTrack} className="w-full h-full object-cover" />
}
