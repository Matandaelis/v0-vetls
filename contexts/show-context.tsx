"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Show, StreamingMetrics } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

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
  loadShows: () => Promise<void>
}

const ShowContext = createContext<ShowContextType | undefined>(undefined)

export function ShowProvider({ children }: { children: React.ReactNode }) {
  const [shows, setShows] = useState<Show[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Load shows from Supabase on mount
  useEffect(() => {
    loadShows()
  }, [])

  const loadShows = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("shows").select("*")
      if (error) throw error
      setShows(data || [])
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
