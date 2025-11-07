"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { Show } from "@/lib/types"
import { mockShows } from "@/lib/mock-data"

interface ShowContextType {
  shows: Show[]
  getShowById: (id: string) => Show | undefined
  getShowsByStatus: (status: "scheduled" | "live" | "ended") => Show[]
  getShowsByCategory: (category: string) => Show[]
  getLiveShows: () => Show[]
  getUpcomingShows: () => Show[]
  updateShowViewerCount: (id: string, count: number) => void
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

  const value: ShowContextType = {
    shows,
    getShowById,
    getShowsByStatus,
    getShowsByCategory,
    getLiveShows,
    getUpcomingShows,
    updateShowViewerCount,
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
