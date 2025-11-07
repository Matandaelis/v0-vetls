"use client"

import type { User } from "@/lib/types"
import { FollowButton } from "@/components/follow-button"

interface UserCardProps {
  user: User
  showFollowButton?: boolean
}

export function UserCard({ user, showFollowButton = true }: UserCardProps) {
  return (
    <div className="flex flex-col items-center p-6 bg-secondary/50 rounded-lg border border-border hover:border-primary transition-colors">
      <img
        src={user.avatar || "/placeholder.svg"}
        alt={user.name}
        className="w-16 h-16 rounded-full object-cover mb-4"
      />
      <h3 className="font-semibold text-center mb-1">{user.name}</h3>
      <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2">{user.bio || "No bio"}</p>
      <div className="flex gap-4 text-center mb-4">
        <div>
          <p className="text-sm font-semibold">{user.followers}</p>
          <p className="text-xs text-muted-foreground">Followers</p>
        </div>
        <div>
          <p className="text-sm font-semibold">{user.following}</p>
          <p className="text-xs text-muted-foreground">Following</p>
        </div>
      </div>
      {showFollowButton && <FollowButton userId={user.id} />}
    </div>
  )
}
