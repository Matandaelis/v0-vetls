"use client"

import { Header } from "@/components/header"
import { ShowCard } from "@/components/show-card"
import { UserCard } from "@/components/user-card"
import { useShows } from "@/contexts/show-context"
import { useSocial } from "@/contexts/social-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Heart, Users, Play, Film } from "lucide-react"
import { mockClips } from "@/lib/mock-data"
import { ClipCard } from "@/components/clip-card"

export default function FeedPage() {
  const { shows, error: showsError } = useShows()
  const { users, error: usersError } = useSocial()

  if (showsError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Unable to load shows</h2>
            <p className="text-muted-foreground mb-6">{showsError.message}</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (usersError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Unable to load users</h2>
            <p className="text-muted-foreground mb-6">{usersError.message}</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const upcomingShows = shows.filter((s) => s.status === "scheduled").slice(0, 6)
  const suggestedUsers = users.filter((u) => !u.isFollowing).slice(0, 4)
  const liveShows = shows.filter((s) => s.status === "live")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      {liveShows.length > 0 && (
        <section className="bg-gradient-to-r from-primary/20 to-primary/5 py-8 border-b border-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-destructive">{liveShows.length} LIVE NOW</span>
            </div>
            <h1 className="text-3xl font-bold">Watch Live Shows</h1>
            <p className="text-muted-foreground mt-2">Join creators and shop in real-time</p>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Tabs defaultValue="clips" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="clips" className="gap-2">
              <Film className="w-4 h-4" />
              <span className="hidden sm:inline">Clips</span>
            </TabsTrigger>
            <TabsTrigger value="following" className="gap-2">
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Following</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="suggested" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Suggested</span>
            </TabsTrigger>
          </TabsList>

          {/* Clips Tab */}
          <TabsContent value="clips" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Trending Clips</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mockClips.map((clip) => (
                  <ClipCard key={clip.id} clip={clip} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Following Shows Tab */}
          <TabsContent value="following" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Shows from Your Following</h2>
              {liveShows.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {liveShows.map((show) => (
                    <ShowCard key={show.id} show={show} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No live shows right now</p>
                  <p className="text-sm text-muted-foreground mb-6">Follow creators to see their shows in your feed</p>
                  <Link href="/shows">
                    <Button>Browse All Shows</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Upcoming Shows Tab */}
          <TabsContent value="upcoming" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Upcoming Shows</h2>
              {upcomingShows.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {upcomingShows.map((show) => (
                    <ShowCard key={show.id} show={show} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No upcoming shows</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Suggested Users Tab */}
          <TabsContent value="suggested" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Suggested Creators</h2>
              {suggestedUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {suggestedUsers.map((user) => (
                    <Link key={user.id} href={`/profile/${user.id}`}>
                      <UserCard user={user} showFollowButton={true} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No suggested users</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Categories */}
      <section className="bg-secondary/30 py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Discover by Interest</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {["Electronics", "Fashion", "Beauty", "Home & Garden"].map((category) => (
              <Link key={category} href={`/category/${category.toLowerCase()}`}>
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  {category}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
