"use client"

import { useState, useRef, useEffect } from "react"
import type { ShowComment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Send, Users } from 'lucide-react'
import { formatDistanceToNow } from "date-fns"

interface ShowChatProps {
  hostName: string
  hostAvatar: string
  initialComments?: ShowComment[]
  viewerCount?: number
}

export function ShowChat({ hostName, hostAvatar, initialComments = [], viewerCount = 1250 }: ShowChatProps) {
  const [comments, setComments] = useState<ShowComment[]>(initialComments)
  const [messageText, setMessageText] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [comments])

  const handleSendMessage = () => {
    if (!messageText.trim()) return

    const newComment: ShowComment = {
      id: Date.now().toString(),
      userId: "user-1",
      userName: "You",
      userAvatar: "/diverse-user-avatars.png",
      content: messageText,
      timestamp: new Date(),
      likes: 0,
    }

    setComments((prev) => [newComment, ...prev])
    setMessageText("")
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Host Info Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src={hostAvatar || "/placeholder.svg"} 
              alt={hostName} 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500"
            />
            <div>
              <p className="font-bold text-sm">{hostName}</p>
              <p className="text-xs text-gray-600">Host</p>
            </div>
          </div>
          <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white">
            Follow
          </Button>
        </div>
        
        {/* Viewer Count */}
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Users className="w-4 h-4" />
          <span className="font-semibold">{viewerCount.toLocaleString()} watching</span>
        </div>
      </div>

      {/* Messages Section */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {comments.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            <p className="text-center">No messages yet.<br/>Be the first to chat!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="text-sm space-y-1 animate-fadeIn">
              <div className="flex items-start gap-2">
                <img
                  src={comment.userAvatar || "/placeholder.svg"}
                  alt={comment.userName}
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-gray-900">{comment.userName}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 break-words">{comment.content}</p>
                  <button
                    className="mt-1 text-xs text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
                    aria-label="Like message"
                  >
                    <Heart className="w-3 h-3" />
                    {comment.likes > 0 && <span>{comment.likes}</span>}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Section */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Input
            placeholder="Say something nice..."
            className="text-sm h-10 rounded-full border-gray-300 focus:ring-pink-500"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-pink-600 hover:bg-pink-700 text-white"
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
