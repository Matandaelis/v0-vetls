import { type NextRequest, NextResponse } from "next/server"
import { SignJWT } from "jose"

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room")
  const username = req.nextUrl.searchParams.get("username")
  const admin = req.nextUrl.searchParams.get("admin")

  if (!room) {
    return NextResponse.json({ error: 'Missing "room" query parameter' }, { status: 400 })
  } else if (!username) {
    return NextResponse.json({ error: 'Missing "username" query parameter' }, { status: 400 })
  }

  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

  if (!apiKey) {
    console.error("[v0] LIVEKIT_API_KEY is not configured")
    return NextResponse.json({ error: "Server misconfigured: Missing API Key" }, { status: 500 })
  }
  if (!apiSecret) {
    console.error("[v0] LIVEKIT_API_SECRET is not configured")
    return NextResponse.json({ error: "Server misconfigured: Missing API Secret" }, { status: 500 })
  }
  if (!wsUrl) {
    console.error("[v0] NEXT_PUBLIC_LIVEKIT_URL is not configured")
    return NextResponse.json({ error: "Server misconfigured: Missing WebSocket URL" }, { status: 500 })
  }

  try {
    const at = new SignJWT({
      sub: username,
      video: {
        room,
        roomJoin: true,
        canPublish: admin === "true",
        canSubscribe: true,
      },
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .setIssuer(apiKey)

    const token = await at.sign(new TextEncoder().encode(apiSecret))

    return NextResponse.json({ token })
  } catch (error) {
    console.error("[v0] Error generating LiveKit token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
