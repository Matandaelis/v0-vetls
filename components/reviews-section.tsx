"use client"

import { useSocial } from "@/contexts/social-context"
import { ReviewCard } from "@/components/review-card"
import { ReviewForm } from "@/components/review-form"

interface ReviewsSectionProps {
  productId?: string
  showId?: string
}

export function ReviewsSection({ productId, showId }: ReviewsSectionProps) {
  const { getRatingsByProductId } = useSocial()
  const reviews = productId ? getRatingsByProductId(productId) : []

  const averageScore =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length).toFixed(1) : 0

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-6">Reviews & Ratings</h2>

        {reviews.length > 0 && (
          <div className="mb-8 p-4 bg-secondary/50 rounded-lg">
            <p className="text-3xl font-bold mb-2">{averageScore}</p>
            <p className="text-muted-foreground">Based on {reviews.length} reviews</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => <ReviewCard key={review.id} review={review} />)
            )}
          </div>
        </div>

        <div>
          <ReviewForm productId={productId} showId={showId} />
        </div>
      </div>
    </div>
  )
}
