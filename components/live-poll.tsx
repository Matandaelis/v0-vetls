"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

interface PollOption {
  id: string
  option_text: string
  vote_count: number
}

interface Poll {
  id: string
  show_id: string
  question: string
  created_at: string
  expires_at?: string
  options: PollOption[]
  userVote?: string
}

interface LivePollProps {
  showId: string
  onVote?: (pollId: string, optionId: string) => void
}

export function LivePoll({ showId, onVote }: LivePollProps) {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    loadPolls()
    
    // Subscribe to poll updates
    const channel = supabase
      .channel(`polls:${showId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_polls',
          filter: `show_id=eq.${showId}`,
        },
        () => {
          loadPolls()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_votes',
        },
        () => {
          loadPolls()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [showId])

  const loadPolls = async () => {
    try {
      setLoading(true)

      // Load active polls with their options
      const { data: pollsData, error: pollsError } = await supabase
        .from('live_polls')
        .select(`
          *,
          poll_options (
            id,
            option_text,
            vote_count
          )
        `)
        .eq('show_id', showId)
        .order('created_at', { ascending: false })

      if (pollsError) throw pollsError

      // Load user's votes if authenticated
      let userVotes: Record<string, string> = {}
      if (user) {
        const pollIds = pollsData?.map(p => p.id) || []
        const { data: votesData } = await supabase
          .from('poll_votes')
          .select('option_id, poll_options!inner(poll_id)')
          .eq('user_id', user.id)
          .in('poll_options.poll_id', pollIds)

        if (votesData) {
          userVotes = votesData.reduce((acc, vote) => {
            const pollId = (vote.poll_options as any).poll_id
            acc[pollId] = vote.option_id
            return acc
          }, {} as Record<string, string>)
        }
      }

      // Format polls with user votes
      const formattedPolls = pollsData?.map(poll => ({
        ...poll,
        options: poll.poll_options || [],
        userVote: userVotes[poll.id],
      })) || []

      setPolls(formattedPolls)
    } catch (error) {
      console.error('Error loading polls:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user) {
      alert('Please sign in to vote')
      return
    }

    try {
      // Insert vote
      const { error: voteError } = await supabase
        .from('poll_votes')
        .insert({
          option_id: optionId,
          user_id: user.id,
        })

      if (voteError) {
        if (voteError.code === '23505') {
          // Duplicate vote
          alert('You have already voted in this poll')
        } else {
          throw voteError
        }
        return
      }

      // Increment vote count
      const { error: updateError } = await supabase.rpc('increment_poll_vote', {
        option_id: optionId,
      })

      if (updateError) throw updateError

      // Reload polls to show updated results
      await loadPolls()

      if (onVote) {
        onVote(pollId, optionId)
      }
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to submit vote. Please try again.')
    }
  }

  const getTotalVotes = (poll: Poll): number => {
    return poll.options.reduce((sum, option) => sum + option.vote_count, 0)
  }

  const getVotePercentage = (option: PollOption, total: number): number => {
    if (total === 0) return 0
    return Math.round((option.vote_count / total) * 100)
  }

  const isExpired = (poll: Poll): boolean => {
    if (!poll.expires_at) return false
    return new Date(poll.expires_at) < new Date()
  }

  const getTimeRemaining = (poll: Poll): string => {
    if (!poll.expires_at) return ''
    
    const now = new Date()
    const expires = new Date(poll.expires_at)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const minutes = Math.floor(diff / 1000 / 60)
    const seconds = Math.floor((diff / 1000) % 60)

    if (minutes > 0) {
      return `${minutes}m ${seconds}s remaining`
    }
    return `${seconds}s remaining`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (polls.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No active polls at the moment
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {polls.map((poll) => {
        const totalVotes = getTotalVotes(poll)
        const expired = isExpired(poll)
        const hasVoted = !!poll.userVote

        return (
          <Card key={poll.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{poll.question}</CardTitle>
                  <CardDescription className="mt-1">
                    {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                  </CardDescription>
                </div>
                {poll.expires_at && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{getTimeRemaining(poll)}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {poll.options.map((option) => {
                const percentage = getVotePercentage(option, totalVotes)
                const isSelected = poll.userVote === option.id

                return (
                  <div key={option.id} className="space-y-2">
                    {!hasVoted && !expired ? (
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3"
                        onClick={() => handleVote(poll.id, option.id)}
                      >
                        {option.option_text}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            )}
                            <span className={isSelected ? 'font-semibold' : ''}>
                              {option.option_text}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {percentage}% ({option.vote_count})
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )}
                  </div>
                )
              })}

              {expired && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  This poll has ended
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
