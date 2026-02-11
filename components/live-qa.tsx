"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, ThumbsUp, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"

interface Question {
  id: string
  show_id: string
  user_id: string
  question: string
  answer?: string
  answered_at?: string
  upvotes: number
  created_at: string
  user: {
    full_name: string
    avatar_url?: string
  }
  user_upvoted?: boolean
}

interface LiveQAProps {
  showId: string
  isHost?: boolean
  onQuestionSubmit?: (question: string) => void
  onAnswer?: (questionId: string, answer: string) => void
}

export function LiveQA({ showId, isHost = false, onQuestionSubmit, onAnswer }: LiveQAProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionText, setQuestionText] = useState("")
  const [answerText, setAnswerText] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    loadQuestions()

    // Subscribe to question updates
    const channel = supabase
      .channel(`qa:${showId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'show_questions',
          filter: `show_id=eq.${showId}`,
        },
        () => {
          loadQuestions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [showId])

  const loadQuestions = async () => {
    try {
      setLoading(true)

      const { data: questionsData, error: questionsError } = await supabase
        .from('show_questions')
        .select(`
          *,
          user:profiles!user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('show_id', showId)
        .order('upvotes', { ascending: false })
        .order('created_at', { ascending: false })

      if (questionsError) throw questionsError

      // Load user's upvotes if authenticated
      let userUpvotes: Set<string> = new Set()
      if (user) {
        const { data: upvotesData } = await supabase
          .from('question_upvotes')
          .select('question_id')
          .eq('user_id', user.id)
          .in('question_id', questionsData?.map(q => q.id) || [])

        if (upvotesData) {
          userUpvotes = new Set(upvotesData.map(u => u.question_id))
        }
      }

      const formattedQuestions = questionsData?.map(q => ({
        ...q,
        user_upvoted: userUpvotes.has(q.id),
      })) || []

      setQuestions(formattedQuestions)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitQuestion = async () => {
    if (!user) {
      alert('Please sign in to ask a question')
      return
    }

    if (!questionText.trim()) return

    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('show_questions')
        .insert({
          show_id: showId,
          user_id: user.id,
          question: questionText.trim(),
        })

      if (error) throw error

      setQuestionText("")
      await loadQuestions()

      if (onQuestionSubmit) {
        onQuestionSubmit(questionText)
      }

      // Scroll to top to see new question
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0
      }
    } catch (error) {
      console.error('Error submitting question:', error)
      alert('Failed to submit question. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpvote = async (questionId: string) => {
    if (!user) {
      alert('Please sign in to upvote')
      return
    }

    try {
      const question = questions.find(q => q.id === questionId)
      if (!question) return

      if (question.user_upvoted) {
        // Remove upvote
        await supabase
          .from('question_upvotes')
          .delete()
          .eq('question_id', questionId)
          .eq('user_id', user.id)

        await supabase.rpc('decrement_question_upvotes', {
          question_id: questionId,
        })
      } else {
        // Add upvote
        await supabase
          .from('question_upvotes')
          .insert({
            question_id: questionId,
            user_id: user.id,
          })

        await supabase.rpc('increment_question_upvotes', {
          question_id: questionId,
        })
      }

      await loadQuestions()
    } catch (error) {
      console.error('Error upvoting question:', error)
    }
  }

  const handleAnswerQuestion = async (questionId: string) => {
    if (!isHost) return

    const answer = answerText[questionId]
    if (!answer?.trim()) return

    try {
      const { error } = await supabase
        .from('show_questions')
        .update({
          answer: answer.trim(),
          answered_at: new Date().toISOString(),
        })
        .eq('id', questionId)

      if (error) throw error

      setAnswerText({ ...answerText, [questionId]: "" })
      await loadQuestions()

      if (onAnswer) {
        onAnswer(questionId, answer)
      }
    } catch (error) {
      console.error('Error answering question:', error)
      alert('Failed to submit answer. Please try again.')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Q&A</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
        {/* Question input */}
        {!isHost && (
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmitQuestion()
                }
              }}
              disabled={submitting}
            />
            <Button
              onClick={handleSubmitQuestion}
              disabled={submitting || !questionText.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Questions list */}
        <ScrollArea className="flex-1 -mx-6 px-6" ref={scrollRef}>
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No questions yet. Be the first to ask!
              </div>
            ) : (
              questions.map((question) => (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border ${
                    question.answered_at
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20'
                      : 'bg-card'
                  }`}
                >
                  {/* Question header */}
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={question.user.avatar_url} />
                      <AvatarFallback>
                        {question.user.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {question.user.full_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(question.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {question.answered_at && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Answered
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{question.question}</p>
                    </div>
                  </div>

                  {/* Answer */}
                  {question.answer && (
                    <div className="mt-3 pl-11 p-3 bg-background rounded-lg border">
                      <p className="text-sm font-semibold mb-1 text-primary">
                        Host's Answer:
                      </p>
                      <p className="text-sm">{question.answer}</p>
                      {question.answered_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(question.answered_at), {
                            addSuffix: true,
                          })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Host answer input */}
                  {isHost && !question.answer && (
                    <div className="mt-3 pl-11 flex gap-2">
                      <Input
                        placeholder="Type your answer..."
                        value={answerText[question.id] || ""}
                        onChange={(e) =>
                          setAnswerText({
                            ...answerText,
                            [question.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleAnswerQuestion(question.id)
                          }
                        }}
                      />
                      <Button
                        onClick={() => handleAnswerQuestion(question.id)}
                        disabled={!answerText[question.id]?.trim()}
                        size="sm"
                      >
                        Answer
                      </Button>
                    </div>
                  )}

                  {/* Upvote button */}
                  <div className="mt-2 pl-11">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpvote(question.id)}
                      className={question.user_upvoted ? 'text-primary' : ''}
                    >
                      <ThumbsUp
                        className={`w-4 h-4 mr-1 ${
                          question.user_upvoted ? 'fill-current' : ''
                        }`}
                      />
                      {question.upvotes}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
