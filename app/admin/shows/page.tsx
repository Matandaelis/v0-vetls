"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, StopCircle, Eye } from 'lucide-react'
import { mockShows } from "@/lib/mock-data"
import { useState } from "react"

export default function AdminShowsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredShows = mockShows.filter(show => 
    show.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    show.hostName.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <div className="font-medium">{show.title}</div>
                    <div className="text-xs text-muted-foreground">{show.category}</div>
                  </TableCell>
                  <TableCell>{show.hostName}</TableCell>
                  <TableCell>
                    <Badge variant={show.status === "live" ? "destructive" : show.status === "scheduled" ? "secondary" : "outline"}>
                      {show.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{show.viewerCount?.toLocaleString() || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Watch Stream">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {show.status === "live" && (
                        <Button variant="ghost" size="icon" className="text-destructive" title="Force Stop Stream">
                          <StopCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
