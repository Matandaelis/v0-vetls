// LiveKit Components
export { LiveKitBroadcaster } from './livekit-broadcaster'
export { LiveKitPlayer } from './livekit-player'
export { MobileBroadcaster } from './MobileBroadcaster'
export { MobilePlayer } from './MobilePlayer'

// Error Handling
export { LiveKitErrorBoundary } from './LiveKitErrorBoundary'

// Analytics
export { LiveKitAnalytics } from './LiveKitAnalytics'

// LiveKit Context
export { LiveKitProvider, useLiveKitContext } from '@/contexts/LiveKitContext'

// Hooks
export { useLiveKit } from '@/hooks/useLiveKit'

// Type Definitions
export interface LiveKitConfig {
  serverUrl: string
  apiKey?: string
  apiSecret?: string
}

export interface LiveKitBroadcasterProps {
  roomName: string
  username: string
  onLeave?: () => void
  onMetricsUpdate?: (metrics: any) => void
  onRecordingStateChange?: (isRecording: boolean) => void
}

export interface LiveKitPlayerProps {
  roomName: string
  viewerName?: string
  onViewerCountUpdate?: (count: number) => void
  onQualityChange?: (quality: string) => void
}

export interface MobileBroadcasterProps {
  roomName: string
  username: string
  onLeave?: () => void
  onRecordingStateChange?: (isRecording: boolean) => void
}

export interface MobilePlayerProps {
  roomName: string
  viewerName?: string
  onViewerCountUpdate?: (count: number) => void
}

export interface AnalyticsMetrics {
  viewerCount: number
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor'
  uploadSpeed: number // kbps
  downloadSpeed: number // kbps
  latency: number // ms
  packetLoss: number // percentage
  uptime: number // seconds
  isRecording: boolean
  bitrate: number // kbps
  resolution: string
  framerate: number // fps
}

// API Route Types
export interface StartRecordingRequest {
  roomName: string
  mode?: 'room_composite' | 'custom'
  audioOnly?: boolean
}

export interface StopRecordingRequest {
  roomName?: string
  egressId?: string
}

export interface RoomStatusResponse {
  roomName: string
  exists: boolean
  status: 'active' | 'empty' | 'not_found'
  participants: Array<{
    identity: string
    name: string
    isPublisher: boolean
    joinedAt: string
    metadata: any
  }>
  metrics: {
    participantCount: number
    duration: number
    isActive: boolean
    isRecording: boolean
  }
  roomInfo: {
    creationTime: string
    numParticipants: number
    capacity: number
    emptyTimeout: number
    metadata: any
  }
}

// LiveKit Integration Utilities
export const createLiveKitToken = async (roomName: string, username: string, admin = false) => {
  const params = new URLSearchParams({
    room: roomName,
    username,
    admin: admin.toString()
  })
  
  const response = await fetch(`/api/livekit/token?${params}`)
  
  if (!response.ok) {
    throw new Error(`Failed to get token: ${response.statusText}`)
  }
  
  return response.json()
}

export const startRecording = async (roomName: string, options?: { mode?: 'room_composite' | 'custom'; audioOnly?: boolean }) => {
  const response = await fetch('/api/livekit/egress/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roomName,
      mode: options?.mode || 'room_composite',
      audioOnly: options?.audioOnly || false
    })
  })
  
  if (!response.ok) {
    throw new Error(`Failed to start recording: ${response.statusText}`)
  }
  
  return response.json()
}

export const stopRecording = async (roomName?: string, egressId?: string) => {
  const response = await fetch('/api/livekit/egress/stop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roomName,
      egressId
    })
  })
  
  if (!response.ok) {
    throw new Error(`Failed to stop recording: ${response.statusText}`)
  }
  
  return response.json()
}

export const getRoomStatus = async (roomName: string): Promise<RoomStatusResponse> => {
  const response = await fetch(`/api/livekit/rooms/status?room=${roomName}`)
  
  if (!response.ok) {
    throw new Error(`Failed to get room status: ${response.statusText}`)
  }
  
  return response.json()
}