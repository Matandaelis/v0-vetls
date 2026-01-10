"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Zap, TrendingUp, Gift } from "lucide-react"

const uniqueFeatures = [
  {
    icon: Zap,
    title: "Live Auction System",
    description: "Real-time bidding during live streams with automated bid matching",
    status: "🔥 Trending",
    color: "bg-orange-50",
  },
  {
    icon: Users,
    title: "Creator Partnerships",
    description: "Influencer affiliate system with real-time commission tracking",
    status: "⭐ Exclusive",
    color: "bg-purple-50",
  },
  {
    icon: Gift,
    title: "Gamification & Loyalty",
    description: "Points, achievements, and tier-based rewards system",
    status: "✨ New",
    color: "bg-blue-50",
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description: "Real-time seller dashboard with conversion metrics",
    status: "📊 Pro",
    color: "bg-green-50",
  },
  {
    icon: Trophy,
    title: "Host Verification",
    description: "Trust score system with automated seller verification",
    status: "🛡️ Security",
    color: "bg-red-50",
  },
  {
    icon: Zap,
    title: "Live Interactions",
    description: "Polls, Q&A, and real-time engagement tools",
    status: "💬 Interactive",
    color: "bg-indigo-50",
  },
]

export function UniqueFeaturesShowcase() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold mb-4">Why We Stand Out</h2>
        <p className="text-xl text-gray-600">Features unique to our platform, not found anywhere else</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniqueFeatures.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card key={index} className={`border-0 shadow-lg ${feature.color} hover:shadow-xl transition-shadow`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Icon className="w-8 h-8 text-gray-800" />
                  <Badge variant="secondary">{feature.status}</Badge>
                </div>
                <CardTitle className="mt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{feature.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
        <h3 className="text-2xl font-bold mb-4">Market Competitive Advantages</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <li className="flex items-start">
            <span className="text-2xl mr-3">🎯</span>
            <div>
              <p className="font-semibold">360° Show Integration</p>
              <p className="text-sm text-gray-600">Video + Shopping + Auctions in one experience</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-2xl mr-3">💰</span>
            <div>
              <p className="font-semibold">Creator Monetization</p>
              <p className="text-sm text-gray-600">Multiple revenue streams for influencers</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-2xl mr-3">🤖</span>
            <div>
              <p className="font-semibold">AI-Driven Recommendations</p>
              <p className="text-sm text-gray-600">Personalized product suggestions in real-time</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-2xl mr-3">📱</span>
            <div>
              <p className="font-semibold">Clips & Short-form Content</p>
              <p className="text-sm text-gray-600">TikTok-style clips for viral product discovery</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
