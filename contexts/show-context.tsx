"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { Show, StreamingMetrics } from "@/lib/types"
import { mockShows } from "@/lib/mock-data"
import type { ShowFormData } from "@/components/host/create-show-modal"

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
  createShow: (showData: ShowFormData) => Promise<Show>
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
    setShows((prevShows) => prevShows.map((show) => (show.id === showId ? { ...show, ...streamData } : show)))
  }

  const createShow = async (showData: ShowFormData): Promise<Show> => {
    // Generate a new show ID
    const newId = String(shows.length + 1)

    const newShow: Show = {
      id: newId,
      title: showData.title,
      description: showData.description,
      hostId: "1", // This should come from auth context in production
      hostName: "Current User", // This should come from auth context
      hostAvatar: "/event-host-stage.png",
      scheduledFor: showData.scheduledFor,
      status: "scheduled",
      thumbnail:
        showData.thumbnail || `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(showData.title)}`,
      category: showData.category,
      viewerCount: 0,
      products: [],
      streamId: undefined,
      rtmpUrl: undefined,
    }

    setShows((prevShows) => [...prevShows, newShow])
    return newShow
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
    createShow,
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
