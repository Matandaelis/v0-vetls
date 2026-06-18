"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Show, StreamingMetrics } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { mapShow, showToDb, type DbShow, type DbProfile } from "@/lib/db/mappers"

interface ShowContextType {
  shows: Show[]
  getShowById: (id: string) => Show | undefined
  getShowsByStatus: (status: "scheduled" | "live" | "ended") => Show[]
  getShowsByCategory: (category: string) => Show[]
  getLiveShows: () => Show[]
  getUpcomingShows: () => Show[]
  updateShowViewerCount: (id: string, count: number) => void
  initializeShow: (showId: string) => Promise<void>
  getStreamingMetrics: (streamId: string) => Promise<StreamingMetrics | null>
  updateShowStream: (showId: string, streamData: Partial<Show>) => void
  loadShows: (page?: number, limit?: number) => Promise<void>
  hasMore: boolean
}

const ShowContext = createContext<ShowContextType | undefined>(undefined)

export function ShowProvider({ children }: { children: React.ReactNode }) {
  const [shows, setShows] = useState<Show[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const supabase = createClient()

  // Load shows from Supabase on mount
  useEffect(() => {
    loadShows(0, 50)
  }, [])

  const loadShows = async (page = 0, limit = 50) => {
    try {
      if (page === 0) setIsLoading(true)

      const from = page * limit
      const to = from + limit - 1

      // Join with profiles to get host information
      const { data, error } = await supabase
        .from("shows")
        .select(`
          *,
          host:profiles!host_id(username, display_name, avatar_url)
        `)
        .order("start_time", { ascending: false })
        .order("id", { ascending: true })
        .range(from, to)

      if (error) throw error
      
      // Map database rows to UI Show models
      const mappedShows = (data || []).map((row: any) => {
        const hostName = row.host?.display_name || row.host?.username || "Unknown Host"
        const hostAvatar = row.host?.avatar_url || ""
        return mapShow(row as DbShow, hostName, hostAvatar)
      })
      
      if (mappedShows.length < limit) {
        setHasMore(false)
      } else {
        setHasMore(true)
      }

      if (page === 0) {
        setShows(mappedShows)
      } else {
        setShows((prev) => {
          const newShows = mappedShows.filter((s) => !prev.some((p) => p.id === s.id))
          return [...prev, ...newShows]
        })
      }
    } catch (error) {
      console.error("[v0] Error loading shows:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getShowById = (id: string) => {
    return shows.find((s) => s.id === id)
  }

  const getShowsByStatus = (status: "scheduled" | "live" | "ended") => {
    return shows.filter((s) => s.status === status)
  }

  const getShowsByCategory = (category: string) => {
    return shows.filter((s) => s.category === category)
  }

  const getLiveShows = () => {
    return getShowsByStatus("live")
  }

  const getUpcomingShows = () => {
    return getShowsByStatus("scheduled")
  }

  const updateShowViewerCount = (id: string, count: number) => {
    setShows((prevShows) => prevShows.map((show) => (show.id === id ? { ...show, viewerCount: count } : show)))
  }

  const initializeShow = async (showId: string) => {
    const show = getShowById(showId)
    if (!show) throw new Error("Show not found")

    // In a real app, you might want to create the room on the server or verify permissions
    // For LiveKit, the room is created automatically when the first participant joins
    const roomName = `show-${showId}`
    updateShowStream(showId, { roomName, status: "live" })
  }

  const getStreamingMetrics = async (streamId: string): Promise<StreamingMetrics | null> => {
    return {
      totalViewers: 0,
      bitrate: 0,
      fps: 0,
      timestamp: new Date(),
    }
  }

  const updateShowStream = (showId: string, streamData: Partial<Show>) => {
    setShows((prevShows) => prevShows.map((show) => (show.id === showId ? { ...show, ...streamData } : show)))
  }

  const value: ShowContextType = {
    shows,
    getShowById,
    getShowsByStatus,
    getShowsByCategory,
    getLiveShows,
    getUpcomingShows,
    updateShowViewerCount,
    initializeShow,
    getStreamingMetrics,
    updateShowStream,
    loadShows,
    hasMore,
  }

  return <ShowContext.Provider value={value}>{children}</ShowContext.Provider>
}

export function useShows() {
  const context = useContext(ShowContext)
  if (!context) {
    throw new Error("useShows must be used within ShowProvider")
  }
  return context
}
