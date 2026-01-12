"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface BidHistory {
  bidder: string
  amount: number
  timestamp: Date
  isProxy?: boolean
}

interface AuctionEnhanced {
  id: string
  productName: string
  startingBid: number
  currentBid: number
  highestBidder: string
  timeRemaining: number
  totalBids: number
  bidIncrement: number
  bidHistory: BidHistory[]
}

export function LiveAuctionEnhanced({ auction }: { auction: AuctionEnhanced }) {
  const [bidAmount, setBidAmount] = useState<number>(Math.ceil(auction.currentBid + auction.bidIncrement))
  const [timeLeft, setTimeLeft] = useState(auction.timeRemaining)
  const [isLoading, setIsLoading] = useState(false)
  const [showBidHistory, setShowBidHistory] = useState(false)
  const [proxyBidAmount, setProxyBidAmount] = useState<number | null>(null)
  const [useProxy, setUseProxy] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handlePlaceBid = async () => {
    if (bidAmount <= auction.currentBid) {
      alert(`Bid must be higher than ${auction.currentBid}`)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auctions/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionId: auction.id,
          bidAmount,
          proxyBidAmount: useProxy ? proxyBidAmount : null,
        }),
      })

      if (response.ok) {
        alert("Bid placed successfully!")
        setBidAmount(Math.ceil(bidAmount + auction.bidIncrement))
        setProxyBidAmount(null)
        setUseProxy(false)
      }
    } catch (error) {
      console.error("Error placing bid:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isEnding = timeLeft < 300 // Last 5 minutes

  return (
    <Card
      className={cn(
        "border-2 bg-gradient-to-br transition-all",
        isEnding ? "border-red-300 from-red-50 to-orange-50" : "border-orange-200 from-orange-50 to-red-50",
      )}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{auction.productName}</CardTitle>
            <CardDescription>Live Auction</CardDescription>
          </div>
          <Badge variant="destructive" className={isEnding ? "animate-pulse" : ""}>
            LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Bid */}
        <div className="bg-white rounded-lg p-4 border-2 border-orange-300">
          <p className="text-sm text-gray-600 mb-1">Current Bid</p>
          <p className="text-4xl font-bold text-orange-600">${auction.currentBid.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">
            Highest bidder: <span className="font-semibold">{auction.highestBidder}</span>
          </p>
        </div>

        {/* Bid History Toggle */}
        <div className="border-t border-orange-200 pt-4">
          <button
            onClick={() => setShowBidHistory(!showBidHistory)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold text-sm">Bid History</span>
            </div>
            {showBidHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showBidHistory && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {auction.bidHistory.slice(0, 10).map((bid, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-2 bg-white rounded border border-gray-200 text-xs"
                >
                  <div className="flex-1">
                    <span className="font-semibold">{bid.bidder}</span>
                    {bid.isProxy && <Badge className="ml-2 h-5 text-xs">Auto Bid</Badge>}
                  </div>
                  <span className="font-bold text-orange-600">${bid.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Time & Stats */}

        {/* Proxy Bidding Section */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useProxy}
              onChange={(e) => setUseProxy(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-semibold">Enable Automatic Bidding</span>
          </label>

          {useProxy && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Maximum Proxy Bid</label>
              <Input
                type="number"
                value={proxyBidAmount || ""}
                onChange={(e) => setProxyBidAmount(e.target.value ? Number.parseFloat(e.target.value) : null)}
                placeholder="Set max auto-bid amount"
                min={bidAmount}
                className="text-sm"
              />
              <p className="text-xs text-gray-600">We'll bid for you up to this amount</p>
            </div>
          )}
        </div>

        {/* Place Bid */}
      </CardContent>
    </Card>
  )
}
