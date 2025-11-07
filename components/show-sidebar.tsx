"use client"

import { useState } from "react"
import type { ShowComment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ShowSidebarProps {
  hostName: string
  hostAvatar: string
  initialComments?: ShowComment[]
}

export function ShowSidebar({ hostName, hostAvatar, initialComments = [] }: ShowSidebarProps) {
  const [comments, setComments] = useState<ShowComment[]>(initialComments)
  const [messageText, setMessageText] = useState("")

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
    <div className="flex flex-col h-full bg-gray-950 border-l border-border">
      {/* Host Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={hostAvatar || "/placeholder.svg"} alt={hostName} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1">
            <p className="font-semibold text-sm">{hostName}</p>
            <p className="text-xs text-muted-foreground">Host</p>
          </div>
          <Button size="sm" variant="outline">
            Follow
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            <p>No messages yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="text-sm space-y-2">
              <div className="flex items-start gap-2">
                <img
                  src={comment.userAvatar || "/placeholder.svg"}
                  alt={comment.userName}
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-xs">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 break-words">{comment.content}</p>
                  <button className="mt-1 text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {comment.likes > 0 && comment.likes}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Say something..."
            className="text-sm bg-gray-900 border-gray-800 h-9"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button size="icon" className="h-9 w-9" onClick={handleSendMessage} disabled={!messageText.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
