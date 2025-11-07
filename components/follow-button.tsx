"use client"

import { useSocial } from "@/contexts/social-context"
import { Button } from "@/components/ui/button"
import { UserCheck, UserPlus } from "lucide-react"

interface FollowButtonProps {
  userId: string
}

export function FollowButton({ userId }: FollowButtonProps) {
  const { toggleFollow, isFollowing } = useSocial()
  const following = isFollowing(userId)

  return (
    <Button
      variant={following ? "outline" : "default"}
      size="sm"
      onClick={() => toggleFollow(userId)}
      className="gap-2"
    >
      {following ? (
        <>
          <UserCheck className="w-4 h-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Follow
        </>
      )}
    </Button>
  )
}
