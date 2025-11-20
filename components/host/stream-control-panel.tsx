"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Radio, Square, Volume2, Share2, Mic, MicOff, Video, VideoOff } from "lucide-react"
import {
  Room,
  createLocalVideoTrack,
  createLocalAudioTrack,
  type LocalVideoTrack,
  type LocalAudioTrack,
} from "livekit-client"

export function StreamControlPanel() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null)
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (room) {
        room.disconnect()
      }
      if (videoTrack) {
        videoTrack.stop()
      }
      if (audioTrack) {
        audioTrack.stop()
      }
    }
  }, [room, videoTrack, audioTrack])

  const startStream = async () => {
    try {
      // 1. Get token
      const response = await fetch(
        `/api/livekit/token?room=default-room&username=host-${Math.floor(Math.random() * 1000)}`,
      )
      const data = await response.json()

      if (!data.token) {
        throw new Error("Failed to get token")
      }

      // 2. Connect to room
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      })

      await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL || "", data.token)
      setRoom(newRoom)

      // 3. Create and publish tracks
      const vTrack = await createLocalVideoTrack({
        resolution: { width: 1280, height: 720 },
        facingMode: "user",
      })
      setVideoTrack(vTrack)

      const aTrack = await createLocalAudioTrack()
      setAudioTrack(aTrack)

      await newRoom.localParticipant.publishTrack(vTrack)
      await newRoom.localParticipant.publishTrack(aTrack)

      // 4. Attach video to element
      if (videoRef.current) {
        vTrack.attach(videoRef.current)
      }

      setIsStreaming(true)
    } catch (error) {
      console.error("Error starting stream:", error)
      alert("Failed to start stream. Please check your camera/microphone permissions and LiveKit configuration.")
    }
  }

  const stopStream = async () => {
    if (room) {
      await room.disconnect()
      setRoom(null)
    }
    if (videoTrack) {
      videoTrack.stop()
      setVideoTrack(null)
    }
    if (audioTrack) {
      audioTrack.stop()
      setAudioTrack(null)
    }
    setIsStreaming(false)
  }

  const toggleMic = () => {
    if (audioTrack) {
      if (isMicOn) {
        audioTrack.mute()
      } else {
        audioTrack.unmute()
      }
      setIsMicOn(!isMicOn)
    }
  }

  const toggleCamera = () => {
    if (videoTrack) {
      if (isCameraOn) {
        videoTrack.mute()
      } else {
        videoTrack.unmute()
      }
      setIsCameraOn(!isCameraOn)
    }
  }

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

          {/* Video Preview Area */}
          <div className="bg-muted rounded-lg aspect-video flex items-center justify-center border-2 border-dashed border-border overflow-hidden relative">
            {isStreaming ? (
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            ) : (
              <div className="text-center">
                <Radio className="w-12 h-12 mx-auto text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">Stream Preview</p>
              </div>
            )}

            {/* Overlay Controls when streaming */}
            {isStreaming && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-full backdrop-blur-sm">
                <Button
                  variant={isMicOn ? "ghost" : "destructive"}
                  size="icon"
                  className="h-8 w-8 rounded-full text-white hover:bg-white/20 hover:text-white"
                  onClick={toggleMic}
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant={isCameraOn ? "ghost" : "destructive"}
                  size="icon"
                  className="h-8 w-8 rounded-full text-white hover:bg-white/20 hover:text-white"
                  onClick={toggleCamera}
                >
                  {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Viewers</p>
            <p className="text-xl font-bold">{isStreaming ? "1,245" : "0"}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-xl font-bold">{isStreaming ? "14:32" : "00:00"}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Bitrate</p>
            <p className="text-xl font-bold">{isStreaming ? "4.5 Mbps" : "0 Mbps"}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={isStreaming ? stopStream : startStream}
            className={`flex-1 gap-2 ${isStreaming ? "bg-destructive hover:bg-destructive/90" : ""}`}
          >
            {isStreaming ? (
              <>
                <Square className="w-4 h-4" />
                Stop Stream
              </>
            ) : (
              <>
                <Radio className="w-4 h-4" />
                Go Live
              </>
            )}
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
