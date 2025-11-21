"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { Show, StreamingMetrics } from "@/lib/types"
import { mockShows } from "@/lib/mock-data"

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
}

const ShowContext = createContext<ShowContextType | undefined>(undefined)

export function ShowProvider({ children }: { children: React.ReactNode }) {
  const [shows, setShows] = useState<Show[]>(mockShows)

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
  }

  return <ShowContext.Provider value={value}>{children}</ShowContext.Provider>
}

export function useShows() {
  const context = useContext(ShowContext)
  if (context === undefined) {
    throw new Error("useShows must be used within a ShowProvider")
  }
  return context
}
