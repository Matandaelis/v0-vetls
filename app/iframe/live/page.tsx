"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { LiveKitRoom, VideoConference, RoomAudioRenderer, useTracks } from "@livekit/components-react"
import "@livekit/components-styles"
import { Track } from "livekit-client"

export default function LiveKitIframePage() {
  const searchParams = useSearchParams()
  const roomName = searchParams.get("room")
  const username = searchParams.get("username") || "Guest"

  const [token, setToken] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!roomName) {
      setIsLoading(false)
      return
    }

    const fetchToken = async () => {
      try {
        const resp = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomName)}&username=${username}`)
        const data = await resp.json()

        if (data.error) {
          console.error("[v0] Token error:", data.error)
          setIsLoading(false)
          return
        }

        setToken(data.token)
        setIsLoading(false)
      } catch (error) {
        console.error("[v0] Failed to fetch token:", error)
        setIsLoading(false)
      }
    }

    fetchToken()
  }, [roomName, username])

  if (!roomName) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>No room specified</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="animate-pulse">Connecting to stream...</div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Failed to connect. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      <LiveKitRoom
        video={false}
        audio={false}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        style={{ height: "100vh" }}
        connect={true}
      >
        <LiveStreamViewer />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}

function LiveStreamViewer() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )

  const hasVideoTracks = tracks.some((track) => track.publication)

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Video Display Area */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
        {hasVideoTracks ? (
          <VideoConference
            chatMessageFormatter={(msg) => {
              return msg
            }}
          />
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-300">Waiting for stream to start...</p>
              <p className="text-sm text-gray-500 mt-1">The host will appear here when they go live</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
