import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()

  return profile?.role === "admin"
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { target_user_id, action_type, reason, duration_minutes } = body

    if (!target_user_id || !action_type || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const actionData: any = {
      moderator_id: user.id,
      target_user_id,
      action_type,
      reason,
    }

    if (duration_minutes) {
      actionData.duration_minutes = duration_minutes
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + duration_minutes)
      actionData.expires_at = expiresAt.toISOString()
    }

    const { data: action, error } = await supabase
      .from("moderation_actions")
      .insert([actionData])
      .select()
      .single()

    if (error) {
      console.error("Moderation action error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (action_type === "ban" || action_type === "timeout") {
      const updateData: any = {}
      if (action_type === "ban") {
        updateData.role = "banned"
      }

      await supabase.from("profiles").update(updateData).eq("id", target_user_id)
    }

    return NextResponse.json(action)
  } catch (error) {
    console.error("Moderation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
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
    const targetUserId = searchParams.get("target_user_id")

    let query = supabase
      .from("moderation_actions")
      .select(
        `
        *,
        moderator:moderator_id (id, username),
        target_user:target_user_id (id, username)
      `,
      )
      .order("created_at", { ascending: false })

    if (targetUserId) {
      query = query.eq("target_user_id", targetUserId)
    }

    const { data: actions, error } = await query

    if (error) {
      console.error("Moderation actions fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(actions || [])
  } catch (error) {
    console.error("Moderation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
