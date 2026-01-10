"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gift, Crown, Star, Zap } from "lucide-react"

interface UserPoints {
  totalPoints: number
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum" | "diamond"
  pointsToNextTier: number
  achievements: string[]
}

const tierThresholds = {
  bronze: { min: 0, max: 500, color: "text-amber-700", bgColor: "bg-amber-50" },
  silver: { min: 500, max: 1500, color: "text-slate-400", bgColor: "bg-slate-50" },
  gold: { min: 1500, max: 5000, color: "text-yellow-600", bgColor: "bg-yellow-50" },
  platinum: { min: 5000, max: 10000, color: "text-cyan-600", bgColor: "bg-cyan-50" },
  diamond: { min: 10000, max: Number.POSITIVE_INFINITY, color: "text-purple-600", bgColor: "bg-purple-50" },
}

export function LoyaltyRewards({ userPoints }: { userPoints: UserPoints }) {
  const currentTierInfo = tierThresholds[userPoints.loyaltyTier]
  const nextTier = {
    bronze: "silver",
    silver: "gold",
    gold: "platinum",
    platinum: "diamond",
    diamond: "diamond",
  }[userPoints.loyaltyTier]

  const progressToNextTier =
    ((userPoints.totalPoints - tierThresholds[userPoints.loyaltyTier as keyof typeof tierThresholds].min) /
      (tierThresholds[nextTier as keyof typeof tierThresholds].min -
        tierThresholds[userPoints.loyaltyTier as keyof typeof tierThresholds].min)) *
    100

  return (
    <div className="space-y-6">
      {/* Points Display */}
      <Card className={`border-2 ${currentTierInfo.bgColor}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Loyalty Points
            </CardTitle>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {userPoints.totalPoints.toLocaleString()} pts
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Tier */}
            <div className="flex items-center gap-3">
              <Crown className={`w-6 h-6 ${currentTierInfo.color}`} />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Current Tier</p>
                <p className={`text-2xl font-bold ${currentTierInfo.color}`}>
                  {userPoints.loyaltyTier.charAt(0).toUpperCase() + userPoints.loyaltyTier.slice(1)}
                </p>
              </div>
            </div>

            {/* Progress to Next Tier */}
            {userPoints.loyaltyTier !== "diamond" && (
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-600">Progress to {nextTier}</p>
                  <p className="text-sm font-semibold">{userPoints.pointsToNextTier} points away</p>
                </div>
                <Progress value={Math.min(progressToNextTier, 100)} className="h-2" />
              </div>
            )}

            {/* Tier Benefits */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm font-semibold mb-2">Tier Benefits</p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>✓ Exclusive discounts and early access</li>
                <li>✓ Free shipping on select items</li>
                <li>✓ Bonus points on purchases</li>
                <li>✓ Priority customer support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {userPoints.achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-amber-200"
              >
                <Zap className="w-6 h-6 text-amber-600" />
                <p className="text-xs font-semibold text-center capitalize">{achievement.replace("_", " ")}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
