import { stopStream } from "@/lib/ant-media-config"

export async function POST(request: Request) {
  try {
    const { streamId } = await request.json()

    if (!streamId) {
      return Response.json({ error: "Missing streamId" }, { status: 400 })
    }

    await stopStream(streamId)

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] Stream stop error:", error)
    return Response.json(
      { error: "Failed to stop stream" },
      { status: 500 }
    )
  }
}
