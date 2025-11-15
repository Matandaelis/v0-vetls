import { initializeAntMediaStream } from "@/lib/ant-media-config"

export async function POST(request: Request) {
  try {
    const { showId, hostName } = await request.json()

    if (!showId || !hostName) {
      return Response.json({ error: "Missing showId or hostName" }, { status: 400 })
    }

    const streamData = await initializeAntMediaStream(showId, hostName)

    return Response.json(streamData, { status: 200 })
  } catch (error) {
    console.error("[v0] Stream initialization error:", error)
    return Response.json(
      { error: "Failed to initialize stream" },
      { status: 500 }
    )
  }
}
