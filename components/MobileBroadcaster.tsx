"use client"

import { useState, useEffect } from "react"
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
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Square, 
  Monitor, 
  Camera, 
  Radio, 
  Settings,
  Smartphone,
  Tablet,
  Monitor as MonitorIcon
} from "lucide-react"

interface MobileBroadcasterProps {
  roomName: string
  username: string
  onLeave?: () => void
  onRecordingStateChange?: (isRecording: boolean) => void
}

export function MobileBroadcaster({ 
  roomName, 
  username, 
  onLeave, 
  onRecordingStateChange 
}: MobileBroadcasterProps) {
  const [token, setToken] = useState("")
  const [showControls, setShowControls] = useState(true)

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
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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
      style={{ height: "100vh", width: "100vw" }}
      onDisconnected={onLeave}
    >
      <div className="relative h-full w-full bg-black">
        <MobileBroadcasterVideoView 
          onShowControls={() => setShowControls(true)}
          onHideControls={() => setShowControls(false)}
        />
        <MobileBroadcasterControls 
          show={showControls}
          onLeave={onLeave}
          onRecordingStateChange={onRecordingStateChange}
        />
      </div>
    </LiveKitRoom>
  )
}

function MobileBroadcasterVideoView({ 
  onShowControls, 
  onHideControls 
}: { 
  onShowControls: () => void
  onHideControls: () => void 
}) {
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

  // Show controls when touching
  const handleTouchStart = () => {
    onShowControls()
    // Auto-hide after 3 seconds
    setTimeout(() => {
      onHideControls()
    }, 3000)
  }

  return (
    <div 
      className="relative w-full h-full flex-1"
      onTouchStart={handleTouchStart}
      onClick={handleTouchStart}
    >
      <VideoTrack trackRef={displayTrack} className="w-full h-full object-cover" />
      
      {/* Mobile-optimized indicators */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <Badge variant={isScreenSharing ? "default" : "secondary"} className="text-xs">
          {isScreenSharing ? <MonitorIcon className="w-3 h-3 mr-1" /> : <Camera className="w-3 h-3 mr-1" />}
          {isScreenSharing ? "Screen" : "Camera"}
        </Badge>

        {/* Device type indicator */}
        <Badge variant="outline" className="text-xs">
          <Smartphone className="w-3 h-3 mr-1" />
          Mobile
        </Badge>
      </div>

      {/* Screen share toggle - mobile optimized */}
      <div className="absolute bottom-24 left-4 right-4 z-10">
        <Button
          variant={isScreenSharing ? "default" : "secondary"}
          size="lg"
          onClick={toggleScreenShare}
          className="w-full gap-3 h-14 text-lg font-semibold"
        >
          {isScreenSharing ? <Camera className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
          {isScreenSharing ? "Switch to Camera" : "Share Screen"}
        </Button>
      </div>
    </div>
  )
}

function MobileBroadcasterControls({ 
  show, 
  onLeave, 
  onRecordingStateChange 
}: { 
  show: boolean
  onLeave?: () => void
  onRecordingStateChange?: (isRecording: boolean) => void
}) {
  const { localParticipant } = useLocalParticipant()
  const room = useRoomContext()
  const connectionState = useConnectionState()
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isRecording, setIsRecording] = useState(false)

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
        await fetch('/api/livekit/egress/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName: room?.name })
        })
        setIsRecording(false)
        onRecordingStateChange?.(false)
      } else {
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

  if (!show) return null

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pb-6">
      {/* Primary Controls - Mobile Optimized */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant={isMicEnabled ? "secondary" : "destructive"}
          size="lg"
          onClick={toggleMic}
          className="rounded-full w-16 h-16"
          aria-label={isMicEnabled ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isMicEnabled ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
        </Button>

        <Button
          variant={isCameraEnabled ? "secondary" : "destructive"}
          size="lg"
          onClick={toggleCamera}
          className="rounded-full w-16 h-16"
          aria-label={isCameraEnabled ? "Turn Camera Off" : "Turn Camera On"}
        >
          {isCameraEnabled ? <Video className="w-8 h-8" /> : <VideoOff className="w-8 h-8" />}
        </Button>

        <Button
          variant={isRecording ? "destructive" : "default"}
          size="lg"
          onClick={toggleRecording}
          className="rounded-full w-16 h-16"
          aria-label={isRecording ? "Stop Recording" : "Start Recording"}
        >
          <Radio className={`w-8 h-8 ${isRecording ? 'animate-pulse' : ''}`} />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleLeave}
          className="flex-1 h-12 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white border-red-600"
        >
          <Square className="w-6 h-6 mr-2" />
          End Stream
        </Button>
      </div>

      {/* Status Indicators */}
      <div className="flex justify-center items-center gap-2 mt-3">
        <Badge variant="destructive" className="animate-pulse">
          🔴 LIVE
        </Badge>
        <span className="text-white/80 text-sm">Mobile Broadcaster</span>
      </div>
    </div>
  )
}