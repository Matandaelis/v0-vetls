import { getStreamMetrics } from "@/lib/ant-media-config"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const streamId = searchParams.get("streamId")

    if (!streamId) {
      return Response.json({ error: "Missing streamId" }, { status: 400 })
    }

    const metrics = await getStreamMetrics(streamId)

    return Response.json(metrics, { status: 200 })
  } catch (error) {
    console.error("[v0] Metrics fetch error:", error)
    return Response.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    )
  }
}
