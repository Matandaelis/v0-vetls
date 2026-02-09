"use client"

import { useEffect, useState } from "react"
import { LiveKitRoom, VideoTrack, useTracks, useConnectionState } from "@livekit/components-react"
import { Track, ConnectionState } from "livekit-client"
import { Users, Settings, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import "@livekit/components-styles"

interface LiveKitPlayerProps {
  roomName: string
  viewerName?: string
  onViewerCountUpdate?: (count: number) => void
  onQualityChange?: (quality: string) => void
}

export function LiveKitPlayer({ 
  roomName, 
  viewerName = "Viewer",
  onViewerCountUpdate,
  onQualityChange 
}: LiveKitPlayerProps) {
  const [token, setToken] = useState("")
  const [showControls, setShowControls] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [streamQuality, setStreamQuality] = useState<'auto' | 'low' | 'medium' | 'high'>('auto')

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
      const interval = setInterval(fetchViewerCount, 10000) // Update every 10 seconds
      return () => clearInterval(interval)
    }
  }, [token, roomName, onViewerCountUpdate])

  if (token === "") {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <LiveKitRoom
        video={false}
        audio={false}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        style={{ height: "100%", width: "100%" }}
      >
        <PlayerView 
          onControlsChange={setShowControls}
          viewerCount={viewerCount}
          streamQuality={streamQuality}
          onQualityChange={(quality) => {
            setStreamQuality(quality)
            onQualityChange?.(quality)
          }}
        />
      </LiveKitRoom>
      
      {/* Global overlay controls */}
      {showControls && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
            {/* Quality indicator */}
            <Badge variant="secondary" className="text-xs">
              {streamQuality.toUpperCase()}
            </Badge>
            
            {/* Viewer count */}
            <div className="bg-black/40 backdrop-blur text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              {viewerCount} watching
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerView({ 
  onControlsChange, 
  viewerCount, 
  streamQuality,
  onQualityChange 
}: { 
  onControlsChange: (show: boolean) => void
  viewerCount: number
  streamQuality: 'auto' | 'low' | 'medium' | 'high'
  onQualityChange: (quality: 'auto' | 'low' | 'medium' | 'high') => void
}) {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare])
  const connectionState = useConnectionState()
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)

  // Find the primary video track (prefer screen share over camera)
  const screenTrack = tracks.find((t) => t.source === Track.Source.ScreenShare)
  const cameraTrack = tracks.find((t) => t.source === Track.Source.Camera)
  const displayTrack = screenTrack || cameraTrack

  // Show controls when mouse moves
  const handleMouseMove = () => {
    onControlsChange(true)
  }

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      onControlsChange(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [showControls, onControlsChange])

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    // Note: LiveKit audio control would be implemented here
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // Note: LiveKit audio mute would be implemented here
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (connectionState !== ConnectionState.Connected) {
    return (
      <div 
        className="flex items-center justify-center w-full h-full bg-black text-white"
        onMouseMove={handleMouseMove}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Connecting to stream...</p>
          <p className="text-sm text-gray-400">Please wait while we establish the connection</p>
        </div>
      </div>
    )
  }

  if (!displayTrack) {
    return (
      <div 
        className="flex items-center justify-center w-full h-full bg-black text-white"
        onMouseMove={handleMouseMove}
      >
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Stream is offline</p>
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
      className="relative w-full h-full bg-black group cursor-none"
      onMouseMove={handleMouseMove}
    >
      <VideoTrack trackRef={displayTrack} className="w-full h-full object-contain" />
      
      {/* Live indicator */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="destructive" className="animate-pulse">
          🔴 LIVE
        </Badge>
      </div>

      {/* Screen share indicator */}
      {screenTrack && (
        <div className="absolute top-4 left-20 z-10">
          <Badge variant="default" className="text-xs">
            📺 Screen Share
          </Badge>
        </div>
      )}

      {/* Bottom controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-between">
          {/* Left side - Volume control */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:text-white hover:bg-white/20"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            
            <div className="w-20 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange([parseInt(e.target.value)])}
                className="w-full cursor-pointer accent-white"
                aria-label="Volume"
              />
            </div>
          </div>

          {/* Center - Quality selector */}
          <div className="flex items-center gap-2">
            <select
              value={streamQuality}
              onChange={(e) => onQualityChange(e.target.value as any)}
              className="w-24 h-8 bg-black/40 border border-white/20 text-white rounded px-2 text-sm appearance-none cursor-pointer"
              aria-label="Stream Quality"
            >
              <option value="auto" className="bg-black text-white">Auto</option>
              <option value="low" className="bg-black text-white">Low</option>
              <option value="medium" className="bg-black text-white">Medium</option>
              <option value="high" className="bg-black text-white">High</option>
            </select>
          </div>

          {/* Right side - Fullscreen */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:text-white hover:bg-white/20"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
