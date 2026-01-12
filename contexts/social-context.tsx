"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, Rating, UserFollow } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface SocialContextType {
  users: User[]
  ratings: Rating[]
  userFollows: UserFollow[]
  getUserById: (id: string) => User | undefined
  getRatingsByProductId: (productId: string) => Rating[]
  toggleFollow: (userId: string) => Promise<void>
  isFollowing: (userId: string) => boolean
  addRating: (rating: Omit<Rating, "id" | "createdAt">) => Promise<void>
  loadData: () => Promise<void>
  isLoading: boolean
}

const SocialContext = createContext<SocialContextType | undefined>(undefined)

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [userFollows, setUserFollows] = useState<UserFollow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Load users from profiles table
      const { data: usersData, error: usersError } = await supabase.from("profiles").select("*")
      if (usersError) throw usersError
      setUsers(usersData || [])

      // Load ratings
      const { data: ratingsData, error: ratingsError } = await supabase.from("ratings").select("*")
      if (ratingsError) throw ratingsError
      setRatings(ratingsData || [])

      // Load follows
      const { data: followsData, error: followsError } = await supabase.from("user_follows").select("*")
      if (followsError) throw followsError
      setUserFollows(followsData || [])
    } catch (error) {
      console.error("[v0] Error loading social data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getUserById = (id: string) => {
    return users.find((u) => u.id === id)
  }

  const getRatingsByProductId = (productId: string) => {
    return ratings.filter((r) => r.product_id === productId)
  }

  const toggleFollow = async (userId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("Not authenticated")

      const existingFollow = userFollows.find((f) => f.follower_id === session.user.id && f.following_id === userId)

      if (existingFollow) {
        // Unfollow
        const { error } = await supabase.from("user_follows").delete().eq("id", existingFollow.id)
        if (error) throw error
      } else {
        // Follow
        const { error } = await supabase.from("user_follows").insert([
          {
            follower_id: session.user.id,
            following_id: userId,
          },
        ])
        if (error) throw error
      }

      await loadData()
    } catch (error) {
      console.error("[v0] Error toggling follow:", error)
      throw error
    }
  }

  const isFollowing = (userId: string) => {
    return userFollows.some((f) => f.following_id === userId)
  }

  const addRating = async (rating: Omit<Rating, "id" | "created_at">) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("Not authenticated")

      const { error } = await supabase.from("ratings").insert([
        {
          ...rating,
          user_id: session.user.id,
        },
      ])
      if (error) throw error
      await loadData()
    } catch (error) {
      console.error("[v0] Error adding rating:", error)
      throw error
    }
  }

  const value: SocialContextType = {
    users,
    ratings,
    userFollows,
    getUserById,
    getRatingsByProductId,
    toggleFollow,
    isFollowing,
    addRating,
    loadData,
    isLoading,
  }

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
}

export function useSocial() {
  const context = useContext(SocialContext)
  if (!context) {
    throw new Error("useSocial must be used within SocialProvider")
  }
  return context
}
