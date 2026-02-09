import { type NextRequest, NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export async function POST(req: NextRequest) {
  try {
    const { roomName, egressId } = await req.json()

    if (!roomName && !egressId) {
      return NextResponse.json({ error: 'Missing roomName or egressId' }, { status: 400 })
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      console.error("LiveKit API credentials not configured")
      return NextResponse.json(
        { error: "Server misconfigured: Missing LiveKit API credentials" },
        { status: 500 }
      )
    }

    // Generate egress token with room record permission
    const at = new AccessToken(apiKey, apiSecret, {
      identity: `egress-${Date.now()}`,
      name: "Egress Service",
    })
    at.addGrant({
      room: roomName || '*',
      roomRecord: true,
    })

    const egressToken = await at.toJwt()

    // Get LiveKit server URL
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL?.replace('wss://', 'https://')
    
    if (!wsUrl) {
      return NextResponse.json(
        { error: "Server misconfigured: Missing WebSocket URL" },
        { status: 500 }
      )
    }

    // Stop recording using LiveKit Egress API
    let stopUrl = `${wsUrl}/twirp/livekit.Egress/StopEgress`
    let requestBody: any = {}

    if (egressId) {
      // Stop specific egress by ID
      requestBody.egress_id = egressId
    } else {
      // Stop all egress for the room
      requestBody.room_name = roomName
    }

    const response = await fetch(stopUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${egressToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("LiveKit Egress API error:", error)
      return NextResponse.json(
        { error: `Failed to stop recording: ${error}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    console.log(`Recording stopped:`, result)
    
    return NextResponse.json({
      success: true,
      egressId: result.egress_id,
      roomName,
      status: 'recording_stopped',
      result
    })

  } catch (error) {
    console.error("Error stopping recording:", error)
    return NextResponse.json(
      { error: "Failed to stop recording" },
      { status: 500 }
    )
  }
}