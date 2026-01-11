// Phase 9 Implementation - Upstash Search
import { Index } from "@upstash/vector"
import { type NextRequest, NextResponse } from "next/server"

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
})

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 })
  }

  try {
    const results = await index.query({
      data: query,
      topK: 10,
      includeMetadata: true,
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
