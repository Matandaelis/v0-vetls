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
    try {
      const show = getShowById(showId)
      if (!show) throw new Error("Show not found")

      const response = await fetch("/api/streams/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showId, hostName: show.hostName }),
      })

      if (!response.ok) throw new Error("Failed to initialize stream")

      const streamData = await response.json()
      updateShowStream(showId, streamData)
    } catch (error) {
      console.error("[v0] Error initializing show stream:", error)
      throw error
    }
  }

  const getStreamingMetrics = async (streamId: string): Promise<StreamingMetrics | null> => {
    try {
      const response = await fetch(`/api/streams/metrics?streamId=${streamId}`)
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error("[v0] Error fetching streaming metrics:", error)
      return null
    }
  }

  const updateShowStream = (showId: string, streamData: Partial<Show>) => {
    setShows((prevShows) =>
      prevShows.map((show) => (show.id === showId ? { ...show, ...streamData } : show))
    )
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
