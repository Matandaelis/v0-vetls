"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface Report {
  id: string
  reason: string
  description: string
  status: string
  created_at: string
  reporter: {
    username: string
  }
  reported_user: {
    id: string
    username: string
  } | null
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [resolutionNotes, setResolutionNotes] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadReports(activeTab)
  }, [activeTab])

  const loadReports = async (status: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/reports?status=${status}`)
      if (!response.ok) throw new Error("Failed to load reports")
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error("Error loading reports:", error)
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateReport = async (reportId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resolution_notes: notes || resolutionNotes,
        }),
      })

      if (!response.ok) throw new Error("Failed to update report")

      toast({
        title: "Success",
        description: "Report updated successfully",
      })

      setResolutionNotes("")
      loadReports(activeTab)
    } catch (error) {
      console.error("Error updating report:", error)
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      })
    }
  }

  const takeAction = async (userId: string, actionType: string, reason: string) => {
    try {
      const response = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_user_id: userId,
          action_type: actionType,
          reason,
          duration_minutes: actionType === "timeout" ? 1440 : undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to take action")

      toast({
        title: "Success",
        description: "Moderation action applied",
      })
    } catch (error) {
      console.error("Error taking action:", error)
      toast({
        title: "Error",
        description: "Failed to apply moderation action",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
        <p className="text-muted-foreground">Review and manage user reports</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending <Badge className="ml-2">{reports.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No reports found</p>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <CardTitle className="text-lg">{report.reason}</CardTitle>
                    </div>
                    <Badge variant="secondary">{report.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reported by</p>
                    <p className="font-medium">@{report.reporter.username}</p>
                  </div>

                  {report.reported_user && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Reported user</p>
                      <p className="font-medium">@{report.reported_user.username}</p>
                    </div>
                  )}

                  {report.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-sm bg-muted p-3 rounded-md">{report.description}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Reported {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>

                  {report.status === "pending" && (
                    <div className="flex gap-2 flex-wrap">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resolve Report</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Resolution notes..."
                              value={resolutionNotes}
                              onChange={(e) => setResolutionNotes(e.target.value)}
                            />
                            <Button onClick={() => updateReport(report.id, "resolved")}>
                              Mark as Resolved
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" onClick={() => updateReport(report.id, "reviewing")}>
                        Mark as Reviewing
                      </Button>

                      <Button variant="outline" onClick={() => updateReport(report.id, "dismissed")}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>

                      {report.reported_user && (
                        <>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              takeAction(report.reported_user!.id, "warning", report.reason)
                            }
                          >
                            Warn User
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              takeAction(report.reported_user!.id, "timeout", report.reason)
                            }
                          >
                            Timeout 24h
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => takeAction(report.reported_user!.id, "ban", report.reason)}
                          >
                            Ban User
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
