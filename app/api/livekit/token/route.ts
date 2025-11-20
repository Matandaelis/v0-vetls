import { type NextRequest, NextResponse } from "next/server"
import { createLiveKitToken } from "@/lib/livekit-config"

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room")
  const username = req.nextUrl.searchParams.get("username") || "guest"
  const canPublish = req.nextUrl.searchParams.get("canPublish") === "true"

  if (!room) {
    return NextResponse.json({ error: 'Missing "room" query parameter' }, { status: 400 })
  }

  try {
    const token = await createLiveKitToken(room, username, canPublish)
    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error generating token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
