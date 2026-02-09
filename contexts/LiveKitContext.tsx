"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useLiveKit } from "@/hooks/useLiveKit"

interface LiveKitContextValue {
  // Global LiveKit state
  currentRoom: string | null
  isHostMode: boolean
  viewerCount: number
  isRecording: boolean
  streamQuality: string
  
  // Actions
  setCurrentRoom: (room: string | null) => void
  setHostMode: (isHost: boolean) => void
  updateViewerCount: (count: number) => void
  setRecordingState: (recording: boolean) => void
  setStreamQuality: (quality: string) => void
  
  // LiveKit integration
  connectToRoom: (roomName: string, username: string, admin?: boolean) => Promise<void>
  disconnectFromRoom: () => Promise<void>
  
  // Error handling
  error: string | null
  clearError: () => void
}

const LiveKitContext = createContext<LiveKitContextValue | undefined>(undefined)

export function LiveKitProvider({ children }: { children: React.ReactNode }) {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [isHostMode, setHostMode] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [isRecording, setRecordingState] = useState(false)
  const [streamQuality, setStreamQuality] = useState('auto')
  const [error, setError] = useState<string | null>(null)

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const connectToRoom = async (roomName: string, username: string, admin = false) => {
    try {
      setError(null)
      setCurrentRoom(roomName)
      setHostMode(admin)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to room'
      setError(errorMessage)
      throw err
    }
  }

  const disconnectFromRoom = async () => {
    try {
      setCurrentRoom(null)
      setHostMode(false)
      setViewerCount(0)
      setRecordingState(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect from room'
      setError(errorMessage)
      throw err
    }
  }

  const updateViewerCount = (count: number) => {
    setViewerCount(count)
  }

  const clearError = () => {
    setError(null)
  }

  const value: LiveKitContextValue = {
    currentRoom,
    isHostMode,
    viewerCount,
    isRecording,
    streamQuality,
    setCurrentRoom,
    setHostMode,
    updateViewerCount,
    setRecordingState,
    setStreamQuality,
    connectToRoom,
    disconnectFromRoom,
    error,
    clearError,
  }

  return (
    <LiveKitContext.Provider value={value}>
      {children}
    </LiveKitContext.Provider>
  )
}

export function useLiveKitContext() {
  const context = useContext(LiveKitContext)
  if (context === undefined) {
    throw new Error("useLiveKitContext must be used within a LiveKitProvider")
  }
  return context
}