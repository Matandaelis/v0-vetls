"use client"

import type React from "react"
import { createContext, useContext } from "react"
import type { AnalyticsData, HostMetrics, ProductAnalytics, RevenueReport } from "@/lib/types"
import { mockAnalyticsData, mockHostMetrics, mockProductAnalytics } from "@/lib/mock-data"

interface AnalyticsContextType {
  analyticsData: AnalyticsData[]
  hostMetrics: HostMetrics[]
  productAnalytics: ProductAnalytics[]
  getHostMetrics: (hostId: string) => HostMetrics | undefined
  getAnalyticsForShow: (showId: string) => AnalyticsData[]
  getRevenueReport: (hostId: string, period: "daily" | "weekly" | "monthly") => RevenueReport
  getProductAnalytics: (productId: string) => ProductAnalytics | undefined
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const analyticsData = mockAnalyticsData
  const hostMetrics = mockHostMetrics
  const productAnalytics = mockProductAnalytics

  const getHostMetrics = (hostId: string) => {
    return hostMetrics.find((m) => m.hostId === hostId)
  }

  const getAnalyticsForShow = (showId: string) => {
    return analyticsData.filter((a) => a.showId === showId)
  }

  const getRevenueReport = (hostId: string, period: "daily" | "weekly" | "monthly"): RevenueReport => {
    const hostData = hostMetrics.find((m) => m.hostId === hostId)
    const endDate = new Date()
    const startDate = new Date()

    if (period === "daily") {
      startDate.setDate(startDate.getDate() - 1)
    } else if (period === "weekly") {
      startDate.setDate(startDate.getDate() - 7)
    } else {
      startDate.setMonth(startDate.getMonth() - 1)
    }

    return {
      period,
      startDate,
      endDate,
      totalRevenue: hostData?.totalRevenue || 0,
      totalOrders: hostData?.totalSales || 0,
      averageOrderValue: (hostData?.totalRevenue || 0) / (hostData?.totalSales || 1),
      topProducts: productAnalytics.slice(0, 5),
    }
  }

  const getProductAnalytics = (productId: string) => {
    return productAnalytics.find((p) => p.productId === productId)
  }

  const value: AnalyticsContextType = {
    analyticsData,
    hostMetrics,
    productAnalytics,
    getHostMetrics,
    getAnalyticsForShow,
    getRevenueReport,
    getProductAnalytics,
  }

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}
