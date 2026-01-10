"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Activity, Zap } from "lucide-react"

interface StreamMetrics {
  ingressBitrate: number
  egressBitrate: number
  ingressPackets: number
  egressPackets: number
  ingressPacketLoss: number
  egressPacketLoss: number
  latency: number
  jitter: number
}

interface StreamMetricsProps {
  isStreaming: boolean
  onMetricsUpdate?: (metrics: StreamMetrics) => void
}

export function StreamMetrics({ isStreaming, onMetricsUpdate }: StreamMetricsProps) {
  const [metrics, setMetrics] = useState<StreamMetrics>({
    ingressBitrate: 0,
    egressBitrate: 0,
    ingressPackets: 0,
    egressPackets: 0,
    ingressPacketLoss: 0,
    egressPacketLoss: 0,
    latency: 0,
    jitter: 0,
  })

  useEffect(() => {
    if (!isStreaming) return

    // Simulate metrics collection from LiveKit
    const interval = setInterval(() => {
      const newMetrics: StreamMetrics = {
        ingressBitrate: Math.random() * 8000 + 2000, // 2-10 Mbps
        egressBitrate: Math.random() * 6000 + 1500, // 1.5-7.5 Mbps
        ingressPackets: Math.floor(Math.random() * 10000),
        egressPackets: Math.floor(Math.random() * 10000),
        ingressPacketLoss: Math.random() * 2, // 0-2% loss
        egressPacketLoss: Math.random() * 2,
        latency: Math.random() * 100 + 20, // 20-120ms
        jitter: Math.random() * 30 + 5, // 5-35ms
      }
      setMetrics(newMetrics)
      onMetricsUpdate?.(newMetrics)
    }, 1000)

    return () => clearInterval(interval)
  }, [isStreaming, onMetricsUpdate])

  const formatBitrate = (bps: number) => {
    if (bps < 1000) return `${bps.toFixed(0)} bps`
    if (bps < 1000000) return `${(bps / 1000).toFixed(1)} Kbps`
    return `${(bps / 1000000).toFixed(2)} Mbps`
  }

  const formatLatency = (ms: number) => `${ms.toFixed(0)}ms`

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Stream Metrics</h4>

      <div className="grid grid-cols-2 gap-2">
        {/* Ingress Section */}
        <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">Ingress</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Bitrate</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {formatBitrate(metrics.ingressBitrate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Packets</span>
              <span className="text-xs text-muted-foreground">{metrics.ingressPackets.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Loss</span>
              <span
                className={`text-xs font-medium ${metrics.ingressPacketLoss > 1 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}
              >
                {metrics.ingressPacketLoss.toFixed(2)}%
              </span>
            </div>
          </div>
        </Card>

        {/* Egress Section */}
        <Card className="p-3 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">Egress</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Bitrate</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {formatBitrate(metrics.egressBitrate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Packets</span>
              <span className="text-xs text-muted-foreground">{metrics.egressPackets.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Loss</span>
              <span
                className={`text-xs font-medium ${metrics.egressPacketLoss > 1 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}
              >
                {metrics.egressPacketLoss.toFixed(2)}%
              </span>
            </div>
          </div>
        </Card>

        {/* Latency & Jitter */}
        <Card className="p-3 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">Latency</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">RTT</span>
              <span
                className={`text-sm font-bold ${metrics.latency > 80 ? "text-destructive" : "text-amber-600 dark:text-amber-400"}`}
              >
                {formatLatency(metrics.latency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Jitter</span>
              <span
                className={`text-xs font-medium ${metrics.jitter > 20 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}
              >
                {formatLatency(metrics.jitter)}
              </span>
            </div>
          </div>
        </Card>

        {/* Health Status */}
        <Card className="p-3 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-semibold text-green-900 dark:text-green-200">Health</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${metrics.ingressPacketLoss < 1 && metrics.latency < 80 ? "bg-green-500" : "bg-destructive"}`}
              />
              <span className="text-xs text-muted-foreground">
                {metrics.ingressPacketLoss < 1 && metrics.latency < 80 ? "Excellent" : "Fair"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {metrics.ingressBitrate > 5000
                ? "High Quality"
                : metrics.ingressBitrate > 2000
                  ? "Good Quality"
                  : "Standard Quality"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
