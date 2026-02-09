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
    const status = searchParams.get("status")

    let query = supabase
      .from("profiles")
      .select("*")
      .eq("role", "host")
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("verification_status", status)
    }

    const { data: sellers, error } = await query

    if (error) {
      console.error("Sellers fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(sellers || [])
  } catch (error) {
    console.error("Sellers API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
