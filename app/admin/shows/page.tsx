"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, StopCircle, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Show } from "@/lib/types"

export default function AdminShowsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [shows, setShows] = useState<Show[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadShows = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("shows").select("*")
        if (error) throw error
        setShows(data || [])
      } catch (error) {
        console.error("[v0] Error loading shows:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadShows()
  }, [supabase])

  const filteredShows = shows.filter(
    (show) =>
      show.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.host_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Show Moderation</h1>
          <p className="text-muted-foreground">Monitor active streams and manage show content.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shows..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading shows...</div>
          ) : filteredShows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No shows found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Show Details</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Viewers</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShows.map((show) => (
                  <TableRow key={show.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{show.title}</p>
                        <p className="text-xs text-muted-foreground">{show.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>{show.host_name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          show.status === "live" ? "default" : show.status === "scheduled" ? "outline" : "secondary"
                        }
                      >
                        {show.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{show.viewer_count?.toLocaleString() || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {show.status === "live" && (
                        <Button variant="destructive" size="sm" className="gap-2">
                          <StopCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
