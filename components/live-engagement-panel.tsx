"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Heart, Gift } from "lucide-react"

interface Poll {
  id: string
  question: string
  options: Array<{ text: string; votes: number }>
  totalVotes: number
}

interface LiveEngagementPanelProps {
  poll?: Poll
  tipTarget?: string
  reactionCounts?: Record<string, number>
}

export function LiveEngagementPanel({ poll, tipTarget, reactionCounts = {} }: LiveEngagementPanelProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [tipAmount, setTipAmount] = useState("")
  const [reactions, setReactions] = useState(reactionCounts)

  const handleReaction = (emoji: string) => {
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }))
  }

  const topReactions = Object.entries(reactions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="space-y-4">
      {/* Poll Section */}
      {poll && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h4 className="font-bold text-sm">{poll.question}</h4>
              <Badge variant="outline" className="text-xs">
                {poll.totalVotes} votes
              </Badge>
            </div>

            <div className="space-y-2">
              {poll.options.map((option) => {
                const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0
                const isSelected = selectedOption === option.text

                return (
                  <button
                    key={option.text}
                    onClick={() => setSelectedOption(option.text)}
                    className={`w-full text-left p-2 rounded-lg transition-all ${
                      isSelected ? "ring-2 ring-blue-500 bg-white" : "bg-white hover:bg-blue-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{option.text}</span>
                      <span className="text-xs text-gray-600">{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Tip Section */}
      {tipTarget && (
        <Card className="p-4 border-pink-200 bg-pink-50">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-pink-600" />
              <h4 className="font-bold text-sm">Send a Tip to {tipTarget}</h4>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 25].map((amount) => (
                <Button
                  key={amount}
                  variant={tipAmount === amount.toString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTipAmount(amount.toString())}
                  className="text-xs"
                >
                  ${amount}
                </Button>
              ))}
            </div>

            <Input
              type="number"
              placeholder="Custom amount"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              className="text-sm h-8"
            />

            <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white text-sm h-9 gap-1">
              <Gift className="w-3 h-3" />
              Send Tip
            </Button>
          </div>
        </Card>
      )}

      {/* Reactions Section */}
      <Card className="p-4">
        <div className="space-y-3">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Live Reactions
          </h4>

          <div className="grid grid-cols-4 gap-2">
            {["❤️", "😍", "🔥", "👏", "😂", "🎉", "💯", "🙌"].map((emoji) => (
              <Button
                key={emoji}
                variant="outline"
                size="sm"
                onClick={() => handleReaction(emoji)}
                className="text-xl h-10 hover:scale-110 transition-transform"
              >
                {emoji}
              </Button>
            ))}
          </div>

          {topReactions.length > 0 && (
            <div className="flex items-center justify-center gap-3 pt-3 border-t">
              {topReactions.map(([emoji, count]) => (
                <div key={emoji} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                  <span className="text-sm">{emoji}</span>
                  <span className="text-xs font-semibold text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
