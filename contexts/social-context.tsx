"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, Rating, UserFollow } from "@/lib/types"
import { mockUsers, mockRatings } from "@/lib/mock-data"

interface SocialContextType {
  users: User[]
  ratings: Rating[]
  userFollows: UserFollow[]
  getUserById: (id: string) => User | undefined
  getRatingsByProductId: (productId: string) => Rating[]
  toggleFollow: (userId: string) => void
  isFollowing: (userId: string) => boolean
  addRating: (rating: Omit<Rating, "id" | "createdAt">) => void
}

const SocialContext = createContext<SocialContextType | undefined>(undefined)

const FOLLOWS_STORAGE_KEY = "talkshop-follows"

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [ratings, setRatings] = useState<Rating[]>(mockRatings)
  const [userFollows, setUserFollows] = useState<UserFollow[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedFollows = localStorage.getItem(FOLLOWS_STORAGE_KEY)
    if (savedFollows) {
      try {
        setUserFollows(JSON.parse(savedFollows))
      } catch (error) {
        console.error("Failed to load follows:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(FOLLOWS_STORAGE_KEY, JSON.stringify(userFollows))
    }
  }, [userFollows, isLoaded])

  const getUserById = (id: string) => {
    return users.find((u) => u.id === id)
  }

  const getRatingsByProductId = (productId: string) => {
    return ratings.filter((r) => r.productId === productId)
  }

  const toggleFollow = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === userId) {
          const newFollowing = u.isFollowing ? u.followers - 1 : u.followers + 1
          return { ...u, isFollowing: !u.isFollowing, followers: newFollowing }
        }
        return u
      }),
    )
  }

  const isFollowing = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.isFollowing || false
  }

  const addRating = (ratingData: Omit<Rating, "id" | "createdAt">) => {
    const newRating: Rating = {
      ...ratingData,
      id: `rating-${Date.now()}`,
      createdAt: new Date(),
    }
    setRatings((prev) => [newRating, ...prev])
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
  }

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
}

export function useSocial() {
  const context = useContext(SocialContext)
  if (context === undefined) {
    throw new Error("useSocial must be used within a SocialProvider")
  }
  return context
}
