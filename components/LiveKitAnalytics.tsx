"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  Activity, 
  Wifi, 
  Upload, 
  Download, 
  Clock,
  Radio,
  AlertCircle
} from "lucide-react"

interface AnalyticsMetrics {
  viewerCount: number
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor'
  uploadSpeed: number // kbps
  downloadSpeed: number // kbps
  latency: number // ms
  packetLoss: number // percentage
  uptime: number // seconds
  isRecording: boolean
  bitrate: number // kbps
  resolution: string
  framerate: number // fps
}

interface LiveKitAnalyticsProps {
  roomName: string
  isHost: boolean
  onMetricsUpdate?: (metrics: AnalyticsMetrics) => void
}

export function LiveKitAnalytics({ 
  roomName, 
  isHost, 
  onMetricsUpdate 
}: LiveKitAnalyticsProps) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    viewerCount: 0,
    connectionQuality: 'good',
    uploadSpeed: 0,
    downloadSpeed: 0,
    latency: 0,
    packetLoss: 0,
    uptime: 0,
    isRecording: false,
    bitrate: 0,
    resolution: '1280x720',
    framerate: 30,
  })

  const [sessionStartTime] = useState(Date.now())

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/livekit/rooms/status?room=${roomName}`)
        if (response.ok) {
          const data = await response.json()
          
          // Simulate real-time metrics (in production, these would come from LiveKit stats)
          const newMetrics: AnalyticsMetrics = {
            viewerCount: data.participants?.length || 0,
            connectionQuality: calculateConnectionQuality(),
            uploadSpeed: isHost ? Math.random() * 2000 + 1000 : 0,
            downloadSpeed: !isHost ? Math.random() * 1000 + 500 : 0,
            latency: Math.random() * 100 + 20,
            packetLoss: Math.random() * 2,
            uptime: Math.floor((Date.now() - sessionStartTime) / 1000),
            isRecording: false, // This would come from recording state
            bitrate: isHost ? Math.random() * 3000 + 1000 : 0,
            resolution: '1280x720',
            framerate: 30,
          }

          setMetrics(newMetrics)
          onMetricsUpdate?.(newMetrics)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      }
    }

    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [roomName, isHost, sessionStartTime, onMetricsUpdate])

  const calculateConnectionQuality = (): AnalyticsMetrics['connectionQuality'] => {
    if (metrics.latency < 50 && metrics.packetLoss < 1) return 'excellent'
    if (metrics.latency < 100 && metrics.packetLoss < 3) return 'good'
    if (metrics.latency < 200 && metrics.packetLoss < 5) return 'fair'
    return 'poor'
  }

  const getQualityColor = (quality: AnalyticsMetrics['connectionQuality']) => {
    switch (quality) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
    }
  }

  const getQualityBadgeVariant = (quality: AnalyticsMetrics['connectionQuality']) => {
    switch (quality) {
      case 'excellent': return 'default'
      case 'good': return 'secondary'
      case 'fair': return 'outline'
      case 'poor': return 'destructive'
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5" />
          Live Analytics
          {metrics.isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Radio className="w-3 h-3 mr-1" />
              REC
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Viewer Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Viewers</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {metrics.viewerCount}
          </div>
        </div>

        {/* Connection Quality */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Quality</span>
          </div>
          <Badge variant={getQualityBadgeVariant(metrics.connectionQuality)}>
            {metrics.connectionQuality.toUpperCase()}
          </Badge>
        </div>

        {/* Network Stats */}
        {isHost && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">Upload</span>
                </div>
                <div className="text-sm font-semibold text-blue-900">
                  {Math.round(metrics.uploadSpeed)} kbps
                </div>
                <Progress value={(metrics.uploadSpeed / 3000) * 100} className="h-1 mt-1" />
              </div>

              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Download className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-800">Download</span>
                </div>
                <div className="text-sm font-semibold text-green-900">
                  {Math.round(metrics.downloadSpeed)} kbps
                </div>
                <Progress value={(metrics.downloadSpeed / 2000) * 100} className="h-1 mt-1" />
              </div>
            </div>

            {/* Bitrate and Resolution */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium text-gray-700">Bitrate</div>
                <div className="text-gray-600">{Math.round(metrics.bitrate)} kbps</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-700">Resolution</div>
                <div className="text-gray-600">{metrics.resolution}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-700">FPS</div>
                <div className="text-gray-600">{metrics.framerate}</div>
              </div>
            </div>
          </>
        )}

        {/* Latency and Packet Loss */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Latency</span>
            <span className={`font-medium ${metrics.latency < 100 ? 'text-green-600' : 'text-yellow-600'}`}>
              {Math.round(metrics.latency)}ms
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Packet Loss</span>
            <span className={`font-medium ${metrics.packetLoss < 1 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.packetLoss.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Uptime */}
        <div className="flex items-center justify-between text-sm pt-2 border-t">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">Uptime</span>
          </div>
          <span className="font-mono text-gray-900">
            {formatDuration(metrics.uptime)}
          </span>
        </div>

        {/* Alerts */}
        {metrics.connectionQuality === 'poor' && (
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs text-red-700">
              Poor connection detected. Consider reducing stream quality.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}