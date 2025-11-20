"use client"

import { useEffect, useState, useRef } from "react"
import { Room, RoomEvent, VideoPresets, Track } from "livekit-client"
import { useSearchParams } from "next/navigation"
import { Send } from "lucide-react"

export default function LiveKitIframePage() {
  const searchParams = useSearchParams()
  const roomName = searchParams.get("room")
  const username = searchParams.get("username") || "Guest"

  const [room, setRoom] = useState<Room | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([])
  const [inputValue, setInputValue] = useState("")
  const videoContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!roomName) return

    const connectToRoom = async () => {
      try {
        // Fetch token
        const resp = await fetch(`/api/livekit/token?room=${roomName}&username=${username}`)
        const data = await resp.json()

        if (data.error) {
          console.error("Token error:", data.error)
          return
        }

        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: VideoPresets.h720.resolution,
          },
        })

        setRoom(newRoom)

        // Handle tracks
        newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
            const element = track.attach()
            if (track.kind === Track.Kind.Video && videoContainerRef.current) {
              videoContainerRef.current.appendChild(element)
              element.style.width = "100%"
              element.style.height = "100%"
              element.style.objectFit = "cover"
            }
          }
        })

        // Handle chat messages (using data channel)
        newRoom.on(RoomEvent.DataReceived, (payload, participant) => {
          const decoder = new TextDecoder()
          const strData = decoder.decode(payload)
          try {
            const msg = JSON.parse(strData)
            if (msg.type === "chat") {
              setMessages((prev) => [...prev, { sender: participant?.identity || "Unknown", text: msg.text }])
            }
          } catch (e) {
            console.error("Failed to parse message", e)
          }
        })

        await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL || "", data.token)
        setIsConnected(true)
        console.log("Connected to LiveKit room:", roomName)
      } catch (error) {
        console.error("Failed to connect to LiveKit:", error)
      }
    }

    connectToRoom()

    return () => {
      if (room) {
        room.disconnect()
      }
    }
  }, [roomName, username])

  const sendMessage = async () => {
    if (!inputValue.trim() || !room) return

    const msg = { type: "chat", text: inputValue }
    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify(msg))

    await room.localParticipant.publishData(data, { reliable: true })
    setMessages((prev) => [...prev, { sender: "Me", text: inputValue }])
    setInputValue("")
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      {/* Video Area */}
      <div className="flex-1 relative bg-gray-900">
        <div ref={videoContainerRef} className="absolute inset-0 flex items-center justify-center">
          {!isConnected && <div className="animate-pulse">Connecting to stream...</div>}
        </div>

        {/* Overlay Chat for Mobile/Fullscreen feel */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          <div className="h-32 overflow-y-auto flex flex-col justify-end pointer-events-auto space-y-2 mask-image-linear-gradient">
            {messages.map((msg, idx) => (
              <div key={idx} className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg self-start max-w-[80%]">
                <span className="font-bold text-yellow-400 text-xs mr-2">{msg.sender}</span>
                <span className="text-sm">{msg.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="h-14 bg-black border-t border-gray-800 flex items-center px-4 gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Say something..."
          className="flex-1 bg-gray-800 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-white outline-none"
        />
        <button onClick={sendMessage} className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
