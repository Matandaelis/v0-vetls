"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Trash2, CheckCircle } from 'lucide-react'

const mockMessages = [
  { id: 1, user: "Sarah K.", message: "Love this product!", approved: true },
  { id: 2, user: "Mike T.", message: "When does it ship?", approved: true },
  { id: 3, user: "Unknown User", message: "Check out my site...", approved: false },
  { id: 4, user: "Emma J.", message: "Perfect for my needs!", approved: true },
  { id: 5, user: "Spam Account", message: "BUY NOW CHEAP!!!", approved: false },
]

export function LiveChatModeration() {
  const [messages, setMessages] = useState(mockMessages)
  const [filter, setFilter] = useState("all")

  const filteredMessages = filter === "pending" ? messages.filter((m) => !m.approved) : messages

  const approveMessage = (id: number) => {
    setMessages(messages.map((m) => (m.id === id ? { ...m, approved: true } : m)))
  }

  const deleteMessage = (id: number) => {
    setMessages(messages.filter((m) => m.id !== id))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Live Chat</h3>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
              >
                Pending ({messages.filter((m) => !m.approved).length})
              </Button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg border ${
                  msg.approved ? "bg-secondary/30 border-border" : "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{msg.user}</p>
                    <p className="text-sm text-foreground/80 mt-1">{msg.message}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!msg.approved && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => approveMessage(msg.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMessage(msg.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">Moderation Tips</h4>
              <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                Review pending messages before they appear in chat. Mark spam as inappropriate to improve quality.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium text-sm mb-3">Chat Stats</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Messages</span>
              <span className="font-medium">847</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Approved</span>
              <span className="font-medium">821</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Blocked</span>
              <span className="font-medium">26</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
