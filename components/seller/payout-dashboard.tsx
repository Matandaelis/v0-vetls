"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, ArrowUpRight, Clock, CheckCircle2, XCircle, CreditCard } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface Balance {
  available_balance: number
  pending_balance: number
  total_earned: number
  total_withdrawn: number
  stripe_account_id: string | null
}

interface Payout {
  id: string
  amount: number
  currency: string
  status: string
  created_at: string
  processed_at: string | null
}

export default function PayoutDashboard() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stripeConnected, setStripeConnected] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)

      const [balanceRes, payoutsRes, connectRes] = await Promise.all([
        fetch("/api/payouts/balance"),
        fetch("/api/payouts/request"),
        fetch("/api/payouts/connect"),
      ])

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json()
        setBalance(balanceData)
      }

      if (payoutsRes.ok) {
        const payoutsData = await payoutsRes.json()
        setPayouts(payoutsData)
      }

      if (connectRes.ok) {
        const connectData = await connectRes.json()
        setStripeConnected(connectData.connected && connectData.details_submitted)
      }
    } catch (error) {
      console.error("Error loading payout data:", error)
      toast({
        title: "Error",
        description: "Failed to load payout information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const connectStripe = async () => {
    try {
      setIsProcessing(true)
      const response = await fetch("/api/payouts/connect", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to connect Stripe")

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Error connecting Stripe:", error)
      toast({
        title: "Error",
        description: "Failed to connect Stripe account",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const requestPayout = async () => {
    const amount = parseFloat(withdrawAmount)

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (!balance || amount > balance.available_balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough available balance",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      const response = await fetch("/api/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to request payout")
      }

      toast({
        title: "Success",
        description: "Payout requested successfully",
      })

      setWithdrawAmount("")
      loadData()
    } catch (error: any) {
      console.error("Error requesting payout:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to request payout",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (!stripeConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Stripe</CardTitle>
          <CardDescription>Connect your Stripe account to receive payouts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm">
              You need to connect your Stripe account to withdraw earnings. This is a one-time setup.
            </p>
          </div>
          <Button onClick={connectStripe} disabled={isProcessing}>
            <CreditCard className="h-4 w-4 mr-2" />
            {isProcessing ? "Connecting..." : "Connect Stripe Account"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance?.available_balance.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance?.pending_balance.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Processing orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance?.total_earned.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance?.total_withdrawn.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">All-time payouts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
          <CardDescription>Withdraw your available balance to your bank account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              min="0"
              step="0.01"
              max={balance?.available_balance || 0}
            />
            <p className="text-xs text-muted-foreground">
              Maximum: ${balance?.available_balance.toFixed(2) || "0.00"}
            </p>
          </div>
          <Button onClick={requestPayout} disabled={isProcessing || !withdrawAmount}>
            <DollarSign className="h-4 w-4 mr-2" />
            {isProcessing ? "Processing..." : "Request Payout"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>View your past payout requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payouts yet</p>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {payout.status === "completed" && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {payout.status === "processing" && <Clock className="h-5 w-5 text-blue-500" />}
                    {payout.status === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
                    {payout.status === "pending" && <Clock className="h-5 w-5 text-orange-500" />}
                    <div>
                      <p className="font-medium">
                        ${payout.amount.toFixed(2)} {payout.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payout.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      payout.status === "completed"
                        ? "default"
                        : payout.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {payout.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
