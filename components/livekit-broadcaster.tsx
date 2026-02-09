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
import { Track, ConnectionState, RoomEvent, LocalTrackPublication, RemoteTrackPublication } from "livekit-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, MicOff, Video, VideoOff, Square, Monitor, Camera, Radio, Settings } from "lucide-react"
import "@livekit/components-styles"

interface LiveKitBroadcasterProps {
  roomName: string
  username: string
  onLeave?: () => void
  onMetricsUpdate?: (metrics: any) => void
  onRecordingStateChange?: (isRecording: boolean) => void
}

export function LiveKitBroadcaster({ 
  roomName, 
  username, 
  onLeave, 
  onMetricsUpdate, 
  onRecordingStateChange 
}: LiveKitBroadcasterProps) {
  const [token, setToken] = useState("")
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)

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
      <div className="flex flex-col h-full">
        <BroadcasterVideoView />
        <BroadcasterControls 
          onLeave={onLeave} 
          onMetricsUpdate={onMetricsUpdate}
          onRecordingStateChange={onRecordingStateChange}
          showAdvanced={showAdvancedControls}
          onToggleAdvanced={() => setShowAdvancedControls(!showAdvancedControls)}
        />
      </div>
    </LiveKitRoom>
  )
}

function BroadcasterVideoView() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare])
  const [currentView, setCurrentView] = useState<'camera' | 'screen'>('camera')
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const { localParticipant } = useLocalParticipant()

  // Get current active tracks
  const cameraTrack = tracks.find((t) => t.source === Track.Source.Camera)
  const screenTrack = tracks.find((t) => t.source === Track.Source.ScreenShare)

  const toggleScreenShare = async () => {
    if (!localParticipant) return

    try {
      if (isScreenSharing) {
        // Stop screen sharing
        const screenTracks = Array.from(localParticipant.videoTracks.values())
          .filter(pub => pub.track?.source === Track.Source.ScreenShare)
        
        for (const publication of screenTracks) {
          await publication.unpublish()
        }
        setIsScreenSharing(false)
        setCurrentView('camera')
      } else {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        })
        
        await localParticipant.publishTrack(stream.getVideoTracks()[0], {
          source: Track.Source.ScreenShare
        })
        setIsScreenSharing(true)
        setCurrentView('screen')
      }
    } catch (error) {
      console.error('Error toggling screen share:', error)
    }
  }

  const displayTrack = currentView === 'screen' && screenTrack ? screenTrack : cameraTrack

  if (!displayTrack) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white rounded-lg">
        <p>No video source available</p>
      </div>
    )
  }

  return (
    <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
      <VideoTrack trackRef={displayTrack} className="w-full h-full object-contain" />
      
      {/* Video source indicator */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant={isScreenSharing ? "default" : "secondary"} className="text-xs">
          {isScreenSharing ? "Screen Share" : "Camera"}
        </Badge>
      </div>

      {/* Screen share toggle button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant={isScreenSharing ? "default" : "secondary"}
          size="sm"
          onClick={toggleScreenShare}
          className="gap-2"
        >
          {isScreenSharing ? <Camera className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
          {isScreenSharing ? "Camera" : "Screen"}
        </Button>
      </div>
    </div>
  )
}

function BroadcasterControls({
  onLeave,
  onMetricsUpdate,
  onRecordingStateChange,
  showAdvanced,
  onToggleAdvanced,
}: {
  onLeave?: () => void
  onMetricsUpdate?: (metrics: any) => void
  onRecordingStateChange?: (isRecording: boolean) => void
  showAdvanced: boolean
  onToggleAdvanced: () => void
}) {
  const { localParticipant } = useLocalParticipant()
  const room = useRoomContext()
  const connectionState = useConnectionState()
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamQuality, setStreamQuality] = useState<'low' | 'medium' | 'high'>('medium')
  const [metrics, setMetrics] = useState({
    ingressBitrate: 0,
    egressBitrate: 0,
    ingressPackets: 0,
    egressPackets: 0,
    viewerCount: 0,
  })

  useEffect(() => {
    if (!room) return

    const handleStatsUpdate = () => {
      try {
        const newMetrics = {
          ingressBitrate: 0,
          egressBitrate: 0,
          ingressPackets: 0,
          egressPackets: 0,
          viewerCount: room.participants.size,
        }

        // Collect stats from local participant
        if (localParticipant) {
          localParticipant.tracks.forEach((publication: LocalTrackPublication) => {
            if (publication.track) {
              publication.track.getStats().then((stats: any) => {
                if (stats?.bytesSent !== undefined) {
                  newMetrics.egressBitrate += (stats.bytesSent * 8) / 1000
                  newMetrics.ingressPackets += stats.packetsSent || 0
                }
              })
            }
          })
        }

        // Collect stats from remote participants
        room.participants.forEach((participant) => {
          participant.tracks.forEach((publication: RemoteTrackPublication) => {
            if (publication.track) {
              publication.track.getStats().then((stats: any) => {
                if (stats?.bytesReceived !== undefined) {
                  newMetrics.ingressBitrate += (stats.bytesReceived * 8) / 1000
                  newMetrics.egressPackets += stats.packetsReceived || 0
                }
              })
            }
          })
        })

        setMetrics(newMetrics)
        onMetricsUpdate?.(newMetrics)
      } catch (error) {
        console.error("[LiveKit] Error collecting stats:", error)
      }
    }

    const interval = setInterval(handleStatsUpdate, 2000)
    room.on(RoomEvent.Disconnected, () => clearInterval(interval))

    return () => clearInterval(interval)
  }, [room, localParticipant, onMetricsUpdate])

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

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        // Stop recording
        await fetch('/api/livekit/egress/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName: room?.name })
        })
        setIsRecording(false)
        onRecordingStateChange?.(false)
      } else {
        // Start recording
        await fetch('/api/livekit/egress/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            roomName: room?.name,
            mode: 'room_composite',
            audioOnly: false
          })
        })
        setIsRecording(true)
        onRecordingStateChange?.(true)
      }
    } catch (error) {
      console.error('Error toggling recording:', error)
    }
  }

  const handleLeave = async () => {
    if (room) {
      if (isRecording) {
        await toggleRecording()
      }
      await room.disconnect()
    }
    onLeave?.()
  }

  const isConnected = connectionState === ConnectionState.Connected

  return (
    <div className="p-4 bg-black/80 backdrop-blur">
      <div className="flex items-center justify-between">
        {/* Primary Controls */}
        <div className="flex items-center gap-3">
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

          <Button
            variant={isRecording ? "destructive" : "secondary"}
            size="sm"
            onClick={toggleRecording}
            className="gap-2"
          >
            <Radio className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
            {isRecording ? 'Stop Rec' : 'Record'}
          </Button>

          <Button variant="destructive" onClick={handleLeave} className="gap-2">
            <Square className="w-4 h-4" />
            End Stream
          </Button>
        </div>

        {/* Status & Metrics */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
              <span>{metrics.viewerCount} viewers</span>
            </div>
          </div>

          {/* Advanced Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleAdvanced}
            className="text-white/60 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Advanced Controls Panel */}
      {showAdvanced && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <Tabs defaultValue="quality">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quality">Quality</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="quality" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Stream Quality</label>
                  <div className="flex gap-2 mt-2">
                    {(['low', 'medium', 'high'] as const).map((quality) => (
                      <Button
                        key={quality}
                        variant={streamQuality === quality ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStreamQuality(quality)}
                      >
                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Upload Speed</div>
                    <div className="text-muted-foreground">{Math.round(metrics.egressBitrate)} kbps</div>
                  </div>
                  <div>
                    <div className="font-medium">Download Speed</div>
                    <div className="text-muted-foreground">{Math.round(metrics.ingressBitrate)} kbps</div>
                  </div>
                  <div>
                    <div className="font-medium">Packets Sent</div>
                    <div className="text-muted-foreground">{metrics.ingressPackets}</div>
                  </div>
                  <div>
                    <div className="font-medium">Packets Received</div>
                    <div className="text-muted-foreground">{metrics.egressPackets}</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// VideoPreview function removed - replaced with BroadcasterVideoView
