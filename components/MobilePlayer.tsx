"use client"

import { useEffect, useState } from "react"
import { LiveKitRoom, VideoTrack, useTracks, useConnectionState } from "@livekit/components-react"
import { Track, ConnectionState } from "livekit-client"
import { Users, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MobilePlayerProps {
  roomName: string
  viewerName?: string
  onViewerCountUpdate?: (count: number) => void
}

export function MobilePlayer({ 
  roomName, 
  viewerName = "Viewer",
  onViewerCountUpdate 
}: MobilePlayerProps) {
  const [token, setToken] = useState("")
  const [showControls, setShowControls] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)

  useEffect(() => {
    ;(async () => {
      try {
        const resp = await fetch(`/api/livekit/token?room=${roomName}&username=${viewerName}`)
        const data = await resp.json()
        setToken(data.token)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [roomName, viewerName])

  // Fetch viewer count periodically
  useEffect(() => {
    const fetchViewerCount = async () => {
      try {
        const resp = await fetch(`/api/livekit/rooms/status?room=${roomName}`)
        if (resp.ok) {
          const data = await resp.json()
          const count = data.participants?.length || 0
          setViewerCount(count)
          onViewerCountUpdate?.(count)
        }
      } catch (error) {
        console.error('Error fetching viewer count:', error)
      }
    }

    if (token) {
      fetchViewerCount()
      const interval = setInterval(fetchViewerCount, 10000)
      return () => clearInterval(interval)
    }
  }, [token, roomName, onViewerCountUpdate])

  if (token === "") {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      <LiveKitRoom
        video={false}
        audio={false}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        style={{ height: "100%", width: "100%" }}
      >
        <MobilePlayerView 
          onControlsChange={setShowControls}
          viewerCount={viewerCount}
        />
      </LiveKitRoom>
      
      {/* Mobile overlay controls */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
          <Badge variant="destructive" className="animate-pulse">
            🔴 LIVE
          </Badge>
          
          <div className="bg-black/40 backdrop-blur text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold">
            <Users className="w-4 h-4" />
            {viewerCount} watching
          </div>
        </div>
      </div>
    </div>
  )
}

function MobilePlayerView({ 
  onControlsChange, 
  viewerCount 
}: { 
  onControlsChange: (show: boolean) => void
  viewerCount: number
}) {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare])
  const connectionState = useConnectionState()
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Find the primary video track (prefer screen share over camera)
  const screenTrack = tracks.find((t) => t.source === Track.Source.ScreenShare)
  const cameraTrack = tracks.find((t) => t.source === Track.Source.Camera)
  const displayTrack = screenTrack || cameraTrack

  // Show controls when touching the screen
  const handleTouchStart = () => {
    onControlsChange(true)
  }

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onControlsChange(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onControlsChange])

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (connectionState !== ConnectionState.Connected) {
    return (
      <div 
        className="flex items-center justify-center w-full h-full bg-black text-white"
        onTouchStart={handleTouchStart}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Connecting...</p>
          <p className="text-sm text-gray-400">Please wait while we establish the connection</p>
        </div>
      </div>
    )
  }

  if (!displayTrack) {
    return (
      <div 
        className="flex items-center justify-center w-full h-full bg-black text-white"
        onTouchStart={handleTouchStart}
      >
        <div className="text-center p-4">
          <p className="text-xl font-semibold mb-2">Stream is offline</p>
          <p className="text-sm text-gray-400 mb-4">
            {viewerCount > 0 
              ? "Host is experiencing technical difficulties" 
              : "Waiting for host to start streaming..."
            }
          </p>
          <div className="animate-pulse bg-gray-800 rounded h-2 w-32 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="relative w-full h-full bg-black"
      onTouchStart={handleTouchStart}
    >
      <VideoTrack trackRef={displayTrack} className="w-full h-full object-cover" />

      {/* Screen share indicator */}
      {screenTrack && (
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="default" className="text-xs">
            📺 Screen Share
          </Badge>
        </div>
      )}

      {/* Mobile bottom controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="space-y-4">
          {/* Volume Control - Mobile Optimized */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleMute}
              className="text-white hover:text-white hover:bg-white/20 rounded-full w-12 h-12"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </Button>
            
            <div className="flex-1 mx-2 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange([parseInt(e.target.value)])}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                aria-label="Volume"
              />
            </div>
            
            <span className="text-white text-sm font-medium min-w-[3rem]">
              {isMuted ? 0 : volume}%
            </span>
          </div>

          {/* Fullscreen Control */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleFullscreen}
              className="text-white hover:text-white hover:bg-white/20 rounded-full w-12 h-12"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-6 h-6" />
              ) : (
                <Maximize className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Touch to show controls indicator */}
      {!showControls && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs">
            Tap to show controls
          </div>
        </div>
      )}
    </div>
  )
}