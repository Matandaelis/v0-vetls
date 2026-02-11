/**
 * Real-time presence tracking system
 * Manages user online status, typing indicators, and activity tracking
 */

import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface PresenceState {
  userId: string
  userName: string
  status: 'online' | 'away' | 'offline'
  lastActive: Date
  currentPage?: string
  metadata?: Record<string, any>
}

export interface TypingState {
  userId: string
  userName: string
  typing: boolean
  timestamp: Date
}

export interface ActivityEvent {
  type: 'view' | 'click' | 'scroll' | 'interaction'
  userId: string
  page: string
  metadata?: Record<string, any>
  timestamp: Date
}

export class PresenceManager {
  private supabase = createClient()
  private channels: Map<string, RealtimeChannel> = new Map()
  private presenceStates: Map<string, Map<string, PresenceState>> = new Map()
  private typingStates: Map<string, Map<string, TypingState>> = new Map()
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map()
  
  /**
   * Join a presence channel (e.g., show, chat room)
   */
  async joinChannel(
    channelName: string,
    userId: string,
    userName: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Create or get channel
    let channel = this.channels.get(channelName)
    
    if (!channel) {
      channel = this.supabase.channel(channelName, {
        config: {
          presence: {
            key: userId,
          },
        },
      })

      // Setup presence event handlers
      channel
        .on('presence', { event: 'sync' }, () => {
          this.handlePresenceSync(channelName, channel!)
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          this.handlePresenceJoin(channelName, key, newPresences)
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          this.handlePresenceLeave(channelName, key, leftPresences)
        })
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
          this.handleTypingEvent(channelName, payload)
        })
        .on('broadcast', { event: 'activity' }, ({ payload }) => {
          this.handleActivityEvent(channelName, payload)
        })

      this.channels.set(channelName, channel)
      await channel.subscribe()
    }

    // Track presence
    const presenceState: PresenceState = {
      userId,
      userName,
      status: 'online',
      lastActive: new Date(),
      metadata,
    }

    await channel.track(presenceState)

    // Start heartbeat
    this.startHeartbeat(channelName, userId)
  }

  /**
   * Leave a presence channel
   */
  async leaveChannel(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName)
    
    if (channel) {
      await channel.untrack()
      await this.supabase.removeChannel(channel)
      this.channels.delete(channelName)
      this.presenceStates.delete(channelName)
      this.typingStates.delete(channelName)
      
      // Clear heartbeat
      const interval = this.heartbeatIntervals.get(channelName)
      if (interval) {
        clearInterval(interval)
        this.heartbeatIntervals.delete(channelName)
      }
    }
  }

  /**
   * Update user presence status
   */
  async updateStatus(
    channelName: string,
    status: 'online' | 'away' | 'offline',
    metadata?: Record<string, any>
  ): Promise<void> {
    const channel = this.channels.get(channelName)
    
    if (channel) {
      const currentState = await channel.presenceState()
      const myState = Object.values(currentState)[0]?.[0] as PresenceState
      
      if (myState) {
        await channel.track({
          ...myState,
          status,
          lastActive: new Date(),
          metadata: metadata || myState.metadata,
        })
      }
    }
  }

  /**
   * Broadcast typing indicator
   */
  async broadcastTyping(
    channelName: string,
    userId: string,
    userName: string,
    typing: boolean
  ): Promise<void> {
    const channel = this.channels.get(channelName)
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId,
          userName,
          typing,
          timestamp: new Date(),
        },
      })
    }
  }

  /**
   * Broadcast activity event
   */
  async broadcastActivity(
    channelName: string,
    activity: ActivityEvent
  ): Promise<void> {
    const channel = this.channels.get(channelName)
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'activity',
        payload: activity,
      })
    }
  }

  /**
   * Get all present users in a channel
   */
  getPresenceStates(channelName: string): PresenceState[] {
    const states = this.presenceStates.get(channelName)
    return states ? Array.from(states.values()) : []
  }

  /**
   * Get typing users in a channel
   */
  getTypingUsers(channelName: string): TypingState[] {
    const states = this.typingStates.get(channelName)
    if (!states) return []

    // Filter out stale typing indicators (older than 5 seconds)
    const now = Date.now()
    const active = Array.from(states.values()).filter(state => {
      return state.typing && now - state.timestamp.getTime() < 5000
    })

    return active
  }

  /**
   * Get online user count for a channel
   */
  getOnlineCount(channelName: string): number {
    const states = this.presenceStates.get(channelName)
    if (!states) return 0

    return Array.from(states.values()).filter(
      state => state.status === 'online'
    ).length
  }

  /**
   * Handle presence sync event
   */
  private handlePresenceSync(channelName: string, channel: RealtimeChannel): void {
    const state = channel.presenceState()
    const presenceMap = new Map<string, PresenceState>()

    for (const [key, presences] of Object.entries(state)) {
      const presence = presences[0] as PresenceState
      if (presence) {
        presenceMap.set(key, presence)
      }
    }

    this.presenceStates.set(channelName, presenceMap)
  }

  /**
   * Handle user joining presence
   */
  private handlePresenceJoin(
    channelName: string,
    key: string,
    newPresences: any[]
  ): void {
    const presenceMap = this.presenceStates.get(channelName) || new Map()
    const presence = newPresences[0] as PresenceState
    
    if (presence) {
      presenceMap.set(key, presence)
      this.presenceStates.set(channelName, presenceMap)
    }
  }

  /**
   * Handle user leaving presence
   */
  private handlePresenceLeave(
    channelName: string,
    key: string,
    leftPresences: any[]
  ): void {
    const presenceMap = this.presenceStates.get(channelName)
    
    if (presenceMap) {
      presenceMap.delete(key)
    }
  }

  /**
   * Handle typing event
   */
  private handleTypingEvent(channelName: string, payload: any): void {
    const typingMap = this.typingStates.get(channelName) || new Map()
    const typingState = payload as TypingState
    
    if (typingState.typing) {
      typingMap.set(typingState.userId, typingState)
    } else {
      typingMap.delete(typingState.userId)
    }
    
    this.typingStates.set(channelName, typingMap)

    // Auto-clear typing indicator after 5 seconds
    setTimeout(() => {
      const currentMap = this.typingStates.get(channelName)
      if (currentMap) {
        const state = currentMap.get(typingState.userId)
        if (state && state.timestamp === typingState.timestamp) {
          currentMap.delete(typingState.userId)
        }
      }
    }, 5000)
  }

  /**
   * Handle activity event
   */
  private handleActivityEvent(channelName: string, payload: any): void {
    // Can be extended to track and aggregate user activities
    const activity = payload as ActivityEvent
    
    // Update user's last active time
    const presenceMap = this.presenceStates.get(channelName)
    if (presenceMap) {
      const userState = presenceMap.get(activity.userId)
      if (userState) {
        userState.lastActive = new Date()
      }
    }
  }

  /**
   * Start heartbeat to keep presence alive
   */
  private startHeartbeat(channelName: string, userId: string): void {
    // Clear existing heartbeat
    const existing = this.heartbeatIntervals.get(channelName)
    if (existing) {
      clearInterval(existing)
    }

    // Send heartbeat every 30 seconds
    const interval = setInterval(async () => {
      const channel = this.channels.get(channelName)
      if (channel) {
        const state = await channel.presenceState()
        const myState = state[userId]?.[0] as PresenceState
        
        if (myState) {
          await channel.track({
            ...myState,
            lastActive: new Date(),
          })
        }
      }
    }, 30000)

    this.heartbeatIntervals.set(channelName, interval)
  }

  /**
   * Cleanup all channels and intervals
   */
  cleanup(): void {
    for (const [channelName] of this.channels) {
      this.leaveChannel(channelName)
    }
  }
}

// Singleton instance
export const presenceManager = new PresenceManager()
