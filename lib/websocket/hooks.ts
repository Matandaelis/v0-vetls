// Phase 10 Implementation - Real-time Features
"use client"

import { useEffect, useState } from "react"

export function useRealTime(channel: string) {
  const [data, setData] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?channel=${channel}`)

    ws.onopen = () => setIsConnected(true)
    ws.onmessage = (event) => setData(JSON.parse(event.data))
    ws.onclose = () => setIsConnected(false)

    return () => ws.close()
  }, [channel])

  return { data, isConnected }
}
