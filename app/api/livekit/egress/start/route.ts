import { type NextRequest, NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export async function POST(req: NextRequest) {
  try {
    const { roomName, mode = 'room_composite', audioOnly = false } = await req.json()

    if (!roomName) {
      return NextResponse.json({ error: 'Missing roomName' }, { status: 400 })
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
      room: roomName,
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

    // Start recording using LiveKit Egress API
    const egressRequest = {
      room_name: roomName,
      audio_only: audioOnly,
      // Room composite mode records all participants
      layout: mode === 'room_composite' ? 'room' : 'custom',
      // Auto-stop recording when room is empty
      auto_stop: true,
      // Store in cloud storage (configure based on your setup)
      file_outputs: [{
        file_type: 'MP4',
        filepath: `recordings/${roomName}/${Date.now()}.mp4`
      }]
    }

    // Call LiveKit Egress API
    const egressUrl = `${wsUrl}/twirp/livekit.Egress/StartRoomEgress`
    
    const response = await fetch(egressUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${egressToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(egressRequest),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("LiveKit Egress API error:", error)
      return NextResponse.json(
        { error: `Failed to start recording: ${error}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    
    console.log(`Recording started for room ${roomName}:`, result)
    
    return NextResponse.json({
      success: true,
      egressId: result.egress_id,
      roomName,
      status: 'recording_started'
    })

  } catch (error) {
    console.error("Error starting recording:", error)
    return NextResponse.json(
      { error: "Failed to start recording" },
      { status: 500 }
    )
  }
}