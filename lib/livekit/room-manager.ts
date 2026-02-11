/**
 * Advanced LiveKit room management
 * Handles room lifecycle, participant management, and analytics
 */

import { Room, RoomEvent, RemoteParticipant, LocalParticipant, ConnectionQuality } from 'livekit-client'
import { metricsCollector, Timer } from '../performance/metrics'

export interface RoomConfig {
  roomName: string
  maxParticipants?: number
  enableRecording?: boolean
  enableChat?: boolean
  videoCaptureDefaults?: {
    resolution: { width: number; height: number }
    frameRate: number
  }
}

export interface ParticipantInfo {
  identity: string
  name: string
  metadata?: any
  connectionQuality: ConnectionQuality
  isSpeaking: boolean
  isCameraEnabled: boolean
  isMicrophoneEnabled: boolean
  joinedAt: Date
}

export interface RoomStats {
  participantCount: number
  publisherCount: number
  subscriberCount: number
  totalBytesReceived: number
  totalBytesSent: number
  avgLatency: number
  connectionQuality: ConnectionQuality
}

export class RoomManager {
  private room: Room | null = null
  private roomName: string | null = null
  private participants: Map<string, ParticipantInfo> = new Map()
  private statsInterval: NodeJS.Timeout | null = null
  private analyticsTimer: Timer | null = null

  constructor() {}

  /**
   * Create and join a room with optimized settings
   */
  async createRoom(config: RoomConfig, token: string): Promise<Room> {
    const timer = new Timer()
    
    try {
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        stopLocalTrackOnUnpublish: true,
        disconnectOnPageLeave: true,
        videoCaptureDefaults: config.videoCaptureDefaults || {
          resolution: { width: 1920, height: 1080 },
          frameRate: 30,
        },
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      this.setupRoomEventHandlers(room)
      
      const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || ''
      await room.connect(wsUrl, token)

      this.room = room
      this.roomName = config.roomName
      this.analyticsTimer = timer

      // Start stats collection
      this.startStatsCollection()

      timer.stopAndRecord('livekit.room.connect', { room: config.roomName })
      
      return room
    } catch (error) {
      timer.stopAndRecord('livekit.room.connect.error', { room: config.roomName })
      throw error
    }
  }

  /**
   * Setup comprehensive room event handlers
   */
  private setupRoomEventHandlers(room: Room): void {
    room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      this.handleParticipantConnected(participant)
      metricsCollector.recordMetric('livekit.participant.connected', 1, {
        room: this.roomName || 'unknown'
      })
    })

    room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      this.handleParticipantDisconnected(participant)
      metricsCollector.recordMetric('livekit.participant.disconnected', 1, {
        room: this.roomName || 'unknown'
      })
    })

    room.on(RoomEvent.ConnectionQualityChanged, (quality: ConnectionQuality, participant) => {
      this.handleConnectionQualityChange(quality, participant)
    })

    room.on(RoomEvent.TrackPublished, () => {
      metricsCollector.recordMetric('livekit.track.published', 1, {
        room: this.roomName || 'unknown'
      })
    })

    room.on(RoomEvent.TrackUnpublished, () => {
      metricsCollector.recordMetric('livekit.track.unpublished', 1, {
        room: this.roomName || 'unknown'
      })
    })

    room.on(RoomEvent.Disconnected, () => {
      this.handleDisconnection()
    })

    room.on(RoomEvent.Reconnecting, () => {
      metricsCollector.recordMetric('livekit.room.reconnecting', 1, {
        room: this.roomName || 'unknown'
      })
    })

    room.on(RoomEvent.Reconnected, () => {
      metricsCollector.recordMetric('livekit.room.reconnected', 1, {
        room: this.roomName || 'unknown'
      })
    })
  }

  /**
   * Handle participant connection
   */
  private handleParticipantConnected(participant: RemoteParticipant): void {
    const info: ParticipantInfo = {
      identity: participant.identity,
      name: participant.name || participant.identity,
      metadata: participant.metadata,
      connectionQuality: participant.connectionQuality,
      isSpeaking: false,
      isCameraEnabled: false,
      isMicrophoneEnabled: false,
      joinedAt: new Date(),
    }

    this.participants.set(participant.identity, info)
  }

  /**
   * Handle participant disconnection
   */
  private handleParticipantDisconnected(participant: RemoteParticipant): void {
    const info = this.participants.get(participant.identity)
    if (info) {
      const duration = Date.now() - info.joinedAt.getTime()
      metricsCollector.recordMetric('livekit.participant.duration', duration, {
        room: this.roomName || 'unknown',
        participant: participant.identity
      })
    }
    
    this.participants.delete(participant.identity)
  }

  /**
   * Handle connection quality changes
   */
  private handleConnectionQualityChange(
    quality: ConnectionQuality,
    participant?: RemoteParticipant | LocalParticipant
  ): void {
    if (participant) {
      const info = this.participants.get(participant.identity)
      if (info) {
        info.connectionQuality = quality
      }
    }

    metricsCollector.recordMetric('livekit.connection.quality', quality, {
      room: this.roomName || 'unknown',
      participant: participant?.identity || 'local'
    })
  }

  /**
   * Handle room disconnection
   */
  private handleDisconnection(): void {
    this.stopStatsCollection()
    
    if (this.analyticsTimer) {
      this.analyticsTimer.stopAndRecord('livekit.room.session.duration', {
        room: this.roomName || 'unknown'
      })
    }

    this.participants.clear()
  }

  /**
   * Start collecting room statistics
   */
  private startStatsCollection(): void {
    this.statsInterval = setInterval(() => {
      if (this.room) {
        const stats = this.getRoomStats()
        
        metricsCollector.recordMetric('livekit.room.participants', stats.participantCount, {
          room: this.roomName || 'unknown'
        })
        
        metricsCollector.recordMetric('livekit.room.bytes.received', stats.totalBytesReceived, {
          room: this.roomName || 'unknown'
        })
        
        metricsCollector.recordMetric('livekit.room.bytes.sent', stats.totalBytesSent, {
          room: this.roomName || 'unknown'
        })
      }
    }, 5000) // Collect every 5 seconds
  }

  /**
   * Stop collecting room statistics
   */
  private stopStatsCollection(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
      this.statsInterval = null
    }
  }

  /**
   * Get current room statistics
   */
  getRoomStats(): RoomStats {
    if (!this.room) {
      return {
        participantCount: 0,
        publisherCount: 0,
        subscriberCount: 0,
        totalBytesReceived: 0,
        totalBytesSent: 0,
        avgLatency: 0,
        connectionQuality: ConnectionQuality.Unknown,
      }
    }

    const participants = Array.from(this.room.remoteParticipants.values())
    
    return {
      participantCount: participants.length + 1, // +1 for local participant
      publisherCount: participants.filter(p => p.trackPublications.size > 0).length,
      subscriberCount: participants.length,
      totalBytesReceived: 0, // Would need to aggregate from participant stats
      totalBytesSent: 0,
      avgLatency: 0,
      connectionQuality: this.room.localParticipant.connectionQuality,
    }
  }

  /**
   * Get all participants
   */
  getParticipants(): ParticipantInfo[] {
    return Array.from(this.participants.values())
  }

  /**
   * Get participant by identity
   */
  getParticipant(identity: string): ParticipantInfo | undefined {
    return this.participants.get(identity)
  }

  /**
   * Disconnect from room
   */
  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect()
      this.room = null
      this.roomName = null
    }
  }

  /**
   * Get current room instance
   */
  getRoom(): Room | null {
    return this.room
  }
}
