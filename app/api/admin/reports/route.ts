import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()

  return profile?.role === "admin"
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "pending"

    const { data: reports, error } = await supabase
      .from("content_reports")
      .select(
        `
        *,
        reporter:reporter_id (id, username, avatar_url),
        reported_user:reported_user_id (id, username, avatar_url),
        reviewer:reviewed_by (id, username)
      `,
      )
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Reports fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(reports || [])
  } catch (error) {
    console.error("Reports API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { reported_user_id, show_id, product_id, message_id, reason, description } = body

    if (!reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 })
    }

    const { data: report, error } = await supabase
      .from("content_reports")
      .insert([
        {
          reporter_id: user.id,
          reported_user_id,
          show_id,
          product_id,
          message_id,
          reason,
          description,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Report creation error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Report API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
