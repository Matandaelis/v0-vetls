"use client"

import type { Rating } from "@/lib/types"
import { RatingDisplay } from "@/components/rating-display"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { useState } from "react"

interface ReviewCardProps {
  review: Rating
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [helpful, setHelpful] = useState(review.helpful)
  const [hasVoted, setHasVoted] = useState(false)

  const handleHelpful = () => {
    if (!hasVoted) {
      setHelpful(helpful + 1)
      setHasVoted(true)
    }
  }

  return (
    <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-4 mb-3">
        <img
          src={review.userAvatar || "/placeholder.svg"}
          alt={review.userName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{review.userName}</h4>
            <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
          <RatingDisplay score={review.score} size="sm" />
        </div>
      </div>

      <div className="mb-3">
        <h5 className="font-medium mb-1">{review.title}</h5>
        <p className="text-sm text-muted-foreground">{review.comment}</p>
      </div>

      <div className="flex items-center gap-4">
        <Button variant={hasVoted ? "default" : "ghost"} size="sm" onClick={handleHelpful} className="gap-2 text-xs">
          <ThumbsUp className="w-3 h-3" />
          Helpful ({helpful})
        </Button>
      </div>
    </div>
  )
}
