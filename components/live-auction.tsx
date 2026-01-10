"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Users } from "lucide-react"

interface Auction {
  id: string
  productName: string
  startingBid: number
  currentBid: number
  highestBidder: string
  timeRemaining: number
  totalBids: number
  bidIncrement: number
}

export function LiveAuction({ auction }: { auction: Auction }) {
  const [bidAmount, setBidAmount] = useState<number>(Math.ceil(auction.currentBid + auction.bidIncrement))
  const [timeLeft, setTimeLeft] = useState(auction.timeRemaining)
  const [isLoading, setIsLoading] = useState(false)

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
        }),
      })

      if (response.ok) {
        alert("Bid placed successfully!")
        setBidAmount(Math.ceil(bidAmount + auction.bidIncrement))
      }
    } catch (error) {
      console.error("Error placing bid:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{auction.productName}</CardTitle>
            <CardDescription>Live Auction</CardDescription>
          </div>
          <Badge variant="destructive" className="animate-pulse">
            LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Bid Display */}
        <div className="bg-white rounded-lg p-4 border-2 border-orange-300">
          <p className="text-sm text-gray-600 mb-1">Current Bid</p>
          <p className="text-4xl font-bold text-orange-600">${auction.currentBid.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">
            Highest bidder: <span className="font-semibold">{auction.highestBidder}</span>
          </p>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-200">
          <Clock className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-sm text-gray-600">Time Remaining</p>
            <p className="text-xl font-bold text-red-600">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </p>
          </div>
        </div>

        {/* Bid Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <p className="text-xs text-gray-600">Total Bids</p>
            </div>
            <p className="text-2xl font-bold">{auction.totalBids}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-xs text-gray-600">Min. Increment</p>
            </div>
            <p className="text-2xl font-bold text-green-600">+${auction.bidIncrement.toFixed(2)}</p>
          </div>
        </div>

        {/* Bid Input */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Your Bid</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number.parseFloat(e.target.value))}
                  min={auction.currentBid + auction.bidIncrement}
                  step={auction.bidIncrement}
                  className="pl-7"
                  placeholder="Enter bid amount"
                />
              </div>
              <Button
                onClick={handlePlaceBid}
                disabled={isLoading || timeLeft <= 0}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isLoading ? "Placing..." : "Place Bid"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Minimum bid: ${(auction.currentBid + auction.bidIncrement).toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
