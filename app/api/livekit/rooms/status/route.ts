import { type NextRequest, NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export async function GET(req: NextRequest) {
  try {
    const roomName = req.nextUrl.searchParams.get("room")
    
    if (!roomName) {
      return NextResponse.json({ error: 'Missing room parameter' }, { status: 400 })
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

    // Generate token with room admin permissions
    const at = new AccessToken(apiKey, apiSecret, {
      identity: `admin-${Date.now()}`,
      name: "Room Admin",
    })
    at.addGrant({
      room: roomName,
      roomAdmin: true,
    })

    const adminToken = await at.toJwt()

    // Get LiveKit server URL
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL?.replace('wss://', 'https://')
    
    if (!wsUrl) {
      return NextResponse.json(
        { error: "Server misconfigured: Missing WebSocket URL" },
        { status: 500 }
      )
    }

    // Get room info from LiveKit
    const roomUrl = `${wsUrl}/twirp/livekit.Room/ListRooms`
    
    const response = await fetch(roomUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("LiveKit Room API error:", error)
      return NextResponse.json(
        { error: `Failed to get room info: ${error}` },
        { status: response.status }
      )
    }

    const rooms = await response.json()
    
    // Find the specific room
    const room = rooms.rooms?.find((r: any) => r.name === roomName)
    
    if (!room) {
      return NextResponse.json({
        roomName,
        exists: false,
        status: 'not_found'
      })
    }

    // Get participants for this room
    const participantsUrl = `${wsUrl}/twirp/livekit.Room/ListParticipants`
    const participantsResponse = await fetch(participantsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ room: roomName }),
    })

    let participants = []
    if (participantsResponse.ok) {
      const participantsData = await participantsResponse.json()
      participants = participantsData.participants || []
    }

    // Calculate room metrics
    const metrics = {
      participantCount: participants.length,
      duration: room.creation_time ? Date.now() - new Date(room.creation_time).getTime() : 0,
      isActive: room.num_participants > 0,
      isRecording: false, // This would need egress status check
    }

    // Basic room status
    const roomStatus = {
      roomName: room.name,
      exists: true,
      status: metrics.isActive ? 'active' : 'empty',
      participants: participants.map((p: any) => ({
        identity: p.identity,
        name: p.name,
        isPublisher: p.can_publish,
        joinedAt: p.joined_at,
        metadata: p.metadata,
      })),
      metrics,
      roomInfo: {
        creationTime: room.creation_time,
        numParticipants: room.num_participants,
        capacity: room.max_participants,
        emptyTimeout: room.empty_timeout,
        metadata: room.metadata,
      }
    }

    return NextResponse.json(roomStatus)

  } catch (error) {
    console.error("Error getting room status:", error)
    return NextResponse.json(
      { error: "Failed to get room status" },
      { status: 500 }
    )
  }
}