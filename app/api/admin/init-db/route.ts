import { NextResponse } from "next/server"
import { runMigrations } from "@/lib/db/migrations"

export async function POST(request: Request) {
  try {
    // Verify admin access (should be enhanced with proper auth check)
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await runMigrations()

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    })
  } catch (error) {
    console.error("Database initialization failed:", error)
    return NextResponse.json({ error: "Database initialization failed" }, { status: 500 })
  }
}
