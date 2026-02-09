"use client"

import { useState, useEffect, useCallback } from "react"
import { Room, ConnectionState, RoomEvent, RemoteParticipant, LocalParticipant } from "livekit-client"

interface UseLiveKitOptions {
  roomName: string
  username: string
  admin?: boolean
}

interface LiveKitState {
  connectionState: ConnectionState
  room: Room | null
  participants: RemoteParticipant[]
  localParticipant: LocalParticipant | null
  isConnected: boolean
  error: string | null
}

interface UseLiveKitReturn extends LiveKitState {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  joinAsHost: () => Promise<void>
  joinAsViewer: () => Promise<void>
}

export function useLiveKit({
  roomName,
  username,
  admin = false
}: UseLiveKitOptions): UseLiveKitReturn {
  const [state, setState] = useState<LiveKitState>({
    connectionState: ConnectionState.Disconnected,
    room: null,
    participants: [],
    localParticipant: null,
    isConnected: false,
    error: null,
  })

  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }))
      
      const resp = await fetch(`/api/livekit/token?room=${roomName}&username=${username}&admin=${admin}`)
      const data = await resp.json()
      
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to get token')
      }

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: { width: 1280, height: 720 },
        },
      })

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        setState(prev => ({
          ...prev,
          participants: [...prev.participants, participant]
        }))
      })

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        setState(prev => ({
          ...prev,
          participants: prev.participants.filter(p => p.identity !== participant.identity)
        }))
      })

      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        setState(prev => ({
          ...prev,
          connectionState: state,
          isConnected: state === ConnectionState.Connected
        }))
      })

      room.on(RoomEvent.Disconnected, () => {
        setState(prev => ({
          ...prev,
          connectionState: ConnectionState.Disconnected,
          isConnected: false,
          room: null,
          participants: [],
          localParticipant: null
        }))
      })

      await room.connect(data.token, { name: username })
      
      setState(prev => ({
        ...prev,
        room,
        localParticipant: room.localParticipant,
        connectionState: room.connectionState,
        isConnected: room.connectionState === ConnectionState.Connected
      }))

    } catch (error) {
      console.error('LiveKit connection error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Connection failed'
      }))
    }
  }, [roomName, username, admin])

  const disconnect = useCallback(async () => {
    if (state.room) {
      await state.room.disconnect()
    }
  }, [state.room])

  const joinAsHost = useCallback(async () => {
    await connect()
  }, [connect])

  const joinAsViewer = useCallback(async () => {
    await connect()
  }, [connect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.room) {
        state.room.disconnect()
      }
    }
  }, [state.room])

  return {
    ...state,
    connect,
    disconnect,
    joinAsHost,
    joinAsViewer,
  }
}