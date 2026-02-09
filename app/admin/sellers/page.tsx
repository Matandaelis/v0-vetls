"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, XCircle, Clock, User } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Seller {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  verification_status: string
  total_sales: number
  rating: number
  created_at: string
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadSellers(activeTab)
  }, [activeTab])

  const loadSellers = async (status: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "host")
        .eq("verification_status", status)
        .order("created_at", { ascending: false })

      if (error) throw error
      setSellers(data || [])
    } catch (error) {
      console.error("Error loading sellers:", error)
      toast({
        title: "Error",
        description: "Failed to load sellers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const approveSeller = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/admin/sellers/${sellerId}/approve`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to approve seller")

      toast({
        title: "Success",
        description: "Seller approved successfully",
      })

      loadSellers(activeTab)
    } catch (error) {
      console.error("Error approving seller:", error)
      toast({
        title: "Error",
        description: "Failed to approve seller",
        variant: "destructive",
      })
    }
  }

  const rejectSeller = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/admin/sellers/${sellerId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Does not meet requirements" }),
      })

      if (!response.ok) throw new Error("Failed to reject seller")

      toast({
        title: "Success",
        description: "Seller rejected",
      })

      loadSellers(activeTab)
    } catch (error) {
      console.error("Error rejecting seller:", error)
      toast({
        title: "Error",
        description: "Failed to reject seller",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seller Management</h1>
        <p className="text-muted-foreground">Review and manage seller applications</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="unverified">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ) : sellers.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No sellers found</p>
              </CardContent>
            </Card>
          ) : (
            sellers.map((seller) => (
              <Card key={seller.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={seller.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{seller.display_name || seller.username}</CardTitle>
                        <p className="text-sm text-muted-foreground">@{seller.username}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        seller.verification_status === "verified"
                          ? "default"
                          : seller.verification_status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {seller.verification_status === "verified" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {seller.verification_status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {seller.verification_status === "unverified" && <XCircle className="h-3 w-3 mr-1" />}
                      {seller.verification_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Sales</p>
                      <p className="text-2xl font-bold">${seller.total_sales.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="text-2xl font-bold">{seller.rating.toFixed(1)} ⭐</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="text-sm font-medium">
                        {new Date(seller.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {seller.verification_status === "pending" && (
                    <div className="flex gap-2">
                      <Button onClick={() => approveSeller(seller.id)} className="flex-1">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectSeller(seller.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
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
