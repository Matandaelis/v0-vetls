"use client"

import { Star } from "lucide-react"

interface RatingDisplayProps {
  score: 1 | 2 | 3 | 4 | 5
  size?: "sm" | "md" | "lg"
}

export function RatingDisplay({ score, size = "md" }: RatingDisplayProps) {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size]

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${star <= score ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  )
}
