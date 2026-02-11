/**
 * Advanced chat moderation for live streams
 * Implements profanity filtering, spam detection, and user warnings
 */

export interface ModerationRule {
  type: 'profanity' | 'spam' | 'caps' | 'links' | 'custom'
  pattern?: RegExp
  action: 'warn' | 'mute' | 'kick' | 'filter'
  threshold?: number
  duration?: number // in seconds
}

export interface ModerationAction {
  userId: string
  userName: string
  action: 'warn' | 'mute' | 'kick' | 'timeout'
  reason: string
  duration?: number
  timestamp: Date
}

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: Date
  filtered?: boolean
  originalContent?: string
}

export interface UserViolation {
  userId: string
  violations: ModerationAction[]
  warningCount: number
  muteCount: number
  lastViolation: Date
}

export class ChatModerationSystem {
  private rules: ModerationRule[] = []
  private violations: Map<string, UserViolation> = new Map()
  private mutedUsers: Map<string, { until: Date; reason: string }> = new Map()
  private profanityList: Set<string> = new Set()
  private spamTracker: Map<string, { messages: string[]; timestamps: number[] }> = new Map()

  constructor() {
    this.initializeDefaultRules()
    this.initializeProfanityList()
  }

  /**
   * Initialize default moderation rules
   */
  private initializeDefaultRules(): void {
    this.rules = [
      {
        type: 'profanity',
        action: 'filter',
      },
      {
        type: 'caps',
        pattern: /^[A-Z\s!?]{10,}$/,
        action: 'warn',
        threshold: 3,
      },
      {
        type: 'spam',
        action: 'warn',
        threshold: 3,
      },
      {
        type: 'links',
        pattern: /(https?:\/\/[^\s]+)/gi,
        action: 'filter',
      },
    ]
  }

  /**
   * Initialize profanity word list
   */
  private initializeProfanityList(): void {
    // Basic profanity list - in production, use a comprehensive list
    const words = [
      'damn', 'hell', 'crap', 'shit', 'fuck', 'bitch', 'ass', 'dick',
      'piss', 'bastard', 'slut', 'whore', 'fag', 'retard',
    ]
    
    this.profanityList = new Set(words.map(w => w.toLowerCase()))
  }

  /**
   * Add custom moderation rule
   */
  addRule(rule: ModerationRule): void {
    this.rules.push(rule)
  }

  /**
   * Remove moderation rule
   */
  removeRule(type: string): void {
    this.rules = this.rules.filter(r => r.type !== type)
  }

  /**
   * Moderate a chat message
   */
  moderateMessage(message: ChatMessage): {
    allowed: boolean
    filtered: ChatMessage
    action?: ModerationAction
  } {
    const violations: ModerationAction[] = []
    let filteredContent = message.content

    // Check each rule
    for (const rule of this.rules) {
      switch (rule.type) {
        case 'profanity':
          const profanityResult = this.checkProfanity(filteredContent)
          if (profanityResult.hasProfanity) {
            filteredContent = profanityResult.filtered
            if (rule.action === 'warn') {
              violations.push(this.createViolation(
                message.userId,
                message.userName,
                'warn',
                'Profanity detected'
              ))
            }
          }
          break

        case 'spam':
          if (this.checkSpam(message.userId, message.content)) {
            violations.push(this.createViolation(
              message.userId,
              message.userName,
              rule.action as any,
              'Spam detected'
            ))
          }
          break

        case 'caps':
          if (rule.pattern && rule.pattern.test(message.content)) {
            violations.push(this.createViolation(
              message.userId,
              message.userName,
              'warn',
              'Excessive caps'
            ))
          }
          break

        case 'links':
          if (rule.pattern && rule.pattern.test(message.content)) {
            if (rule.action === 'filter') {
              filteredContent = filteredContent.replace(rule.pattern, '[link removed]')
            }
          }
          break

        case 'custom':
          if (rule.pattern && rule.pattern.test(message.content)) {
            violations.push(this.createViolation(
              message.userId,
              message.userName,
              rule.action as any,
              'Custom rule violation'
            ))
          }
          break
      }
    }

    // Track violations
    if (violations.length > 0) {
      this.trackViolations(message.userId, violations)
    }

    // Check if user should be muted
    const userViolations = this.violations.get(message.userId)
    if (userViolations && userViolations.warningCount >= 3) {
      this.muteUser(message.userId, 300, 'Repeated violations') // 5 minutes
    }

    // Check if user is muted
    if (this.isUserMuted(message.userId)) {
      return {
        allowed: false,
        filtered: message,
        action: {
          userId: message.userId,
          userName: message.userName,
          action: 'mute',
          reason: 'User is muted',
          timestamp: new Date(),
        }
      }
    }

    return {
      allowed: true,
      filtered: {
        ...message,
        content: filteredContent,
        filtered: filteredContent !== message.content,
        originalContent: message.content,
      },
      action: violations[0],
    }
  }

  /**
   * Check for profanity in message
   */
  private checkProfanity(content: string): { hasProfanity: boolean; filtered: string } {
    const words = content.toLowerCase().split(/\s+/)
    let hasProfanity = false
    let filtered = content

    for (const word of words) {
      // Remove punctuation for checking
      const cleanWord = word.replace(/[^\w]/g, '')
      
      if (this.profanityList.has(cleanWord)) {
        hasProfanity = true
        // Replace with asterisks
        const replacement = '*'.repeat(word.length)
        filtered = filtered.replace(new RegExp(word, 'gi'), replacement)
      }
    }

    return { hasProfanity, filtered }
  }

  /**
   * Check for spam behavior
   */
  private checkSpam(userId: string, content: string): boolean {
    const now = Date.now()
    const timeWindow = 10000 // 10 seconds
    const maxMessages = 5

    if (!this.spamTracker.has(userId)) {
      this.spamTracker.set(userId, { messages: [], timestamps: [] })
    }

    const tracker = this.spamTracker.get(userId)!
    
    // Clean old messages
    tracker.timestamps = tracker.timestamps.filter(t => now - t < timeWindow)
    tracker.messages = tracker.messages.slice(-maxMessages)

    // Add current message
    tracker.timestamps.push(now)
    tracker.messages.push(content)

    // Check for spam
    if (tracker.timestamps.length >= maxMessages) {
      // Check for duplicate messages
      const uniqueMessages = new Set(tracker.messages.slice(-maxMessages))
      if (uniqueMessages.size <= 2) {
        return true // Repeating same message
      }
    }

    return false
  }

  /**
   * Create violation record
   */
  private createViolation(
    userId: string,
    userName: string,
    action: 'warn' | 'mute' | 'kick' | 'timeout',
    reason: string
  ): ModerationAction {
    return {
      userId,
      userName,
      action,
      reason,
      timestamp: new Date(),
    }
  }

  /**
   * Track user violations
   */
  private trackViolations(userId: string, violations: ModerationAction[]): void {
    if (!this.violations.has(userId)) {
      this.violations.set(userId, {
        userId,
        violations: [],
        warningCount: 0,
        muteCount: 0,
        lastViolation: new Date(),
      })
    }

    const userViolations = this.violations.get(userId)!
    userViolations.violations.push(...violations)
    userViolations.lastViolation = new Date()

    for (const violation of violations) {
      if (violation.action === 'warn') {
        userViolations.warningCount++
      } else if (violation.action === 'mute') {
        userViolations.muteCount++
      }
    }
  }

  /**
   * Mute a user
   */
  muteUser(userId: string, durationSeconds: number, reason: string): void {
    const until = new Date(Date.now() + durationSeconds * 1000)
    this.mutedUsers.set(userId, { until, reason })
  }

  /**
   * Unmute a user
   */
  unmuteUser(userId: string): void {
    this.mutedUsers.delete(userId)
  }

  /**
   * Check if user is muted
   */
  isUserMuted(userId: string): boolean {
    const mute = this.mutedUsers.get(userId)
    if (!mute) return false

    if (new Date() > mute.until) {
      this.mutedUsers.delete(userId)
      return false
    }

    return true
  }

  /**
   * Get user violations
   */
  getUserViolations(userId: string): UserViolation | undefined {
    return this.violations.get(userId)
  }

  /**
   * Get all muted users
   */
  getMutedUsers(): Array<{ userId: string; until: Date; reason: string }> {
    const now = new Date()
    const muted: Array<{ userId: string; until: Date; reason: string }> = []

    for (const [userId, mute] of this.mutedUsers.entries()) {
      if (mute.until > now) {
        muted.push({ userId, ...mute })
      } else {
        this.mutedUsers.delete(userId)
      }
    }

    return muted
  }

  /**
   * Clear all violations for a user
   */
  clearUserViolations(userId: string): void {
    this.violations.delete(userId)
    this.spamTracker.delete(userId)
  }

  /**
   * Reset all moderation data
   */
  reset(): void {
    this.violations.clear()
    this.mutedUsers.clear()
    this.spamTracker.clear()
  }
}

// Singleton instance
export const chatModeration = new ChatModerationSystem()
