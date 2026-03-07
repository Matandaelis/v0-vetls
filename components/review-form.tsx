"use client"

import type React from "react"

import { useState } from "react"
import { useSocial } from "@/contexts/social-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star } from "lucide-react"

interface ReviewFormProps {
  productId?: string
  showId?: string
}

export function ReviewForm({ productId, showId }: ReviewFormProps) {
  const { addRating } = useSocial()
  const [score, setScore] = useState<1 | 2 | 3 | 4 | 5>(5)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !comment.trim()) return

    setIsSubmitting(true)
    addRating({
      userId: "current-user",
      userName: "Your Name",
      userAvatar: "/placeholder.svg",
      score,
      title,
      comment,
      productId,
      showId,
      helpful: 0,
    })

    setTitle("")
    setComment("")
    setScore(5)
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-secondary/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" id="rating-label">Rating</label>
        <div className="flex gap-2" role="radiogroup" aria-labelledby="rating-label">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={star === score}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              onClick={() => setScore(star as 1 | 2 | 3 | 4 | 5)}
              className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm transition-colors"
            >
              <Star
                className={`w-6 h-6 ${star <= score ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Title</label>
        <Input placeholder="What did you think?" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Review</label>
        <textarea
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={4}
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  )
}
