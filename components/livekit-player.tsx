"use client"

import { useEffect, useState } from "react"
import { LiveKitRoom, VideoTrack, useTracks, useConnectionState } from "@livekit/components-react"
import { Track, ConnectionState } from "livekit-client"
import { Users } from "lucide-react"
import "@livekit/components-styles"

interface LiveKitPlayerProps {
  roomName: string
  viewerName?: string
}

export function LiveKitPlayer({ roomName, viewerName = "Viewer" }: LiveKitPlayerProps) {
  const [token, setToken] = useState("")

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

  if (token === "") {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <LiveKitRoom
      video={false}
      audio={false}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100%", width: "100%" }}
    >
      <PlayerView />
    </LiveKitRoom>
  )
}

function PlayerView() {
  const tracks = useTracks([Track.Source.Camera])
  const connectionState = useConnectionState()
  const cameraTrack = tracks.find((t) => t.source === Track.Source.Camera)

  if (connectionState !== ConnectionState.Connected) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white">
        <p>Connecting...</p>
      </div>
    )
  }

  if (!cameraTrack) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Stream has ended or is offline</p>
          <p className="text-sm text-gray-400">Waiting for host to join...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-black group">
      <VideoTrack trackRef={cameraTrack} className="w-full h-full object-contain" />

      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/40 backdrop-blur text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold">
          <Users className="w-3.5 h-3.5" />
          LIVE
        </div>
      </div>
    </div>
  )
}
