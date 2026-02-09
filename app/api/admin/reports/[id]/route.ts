import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()

  return profile?.role === "admin"
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { status, resolution_notes } = body

    const updateData: any = {
      status,
      reviewed_by: user.id,
      resolved_at: new Date().toISOString(),
    }

    if (resolution_notes) {
      updateData.resolution_notes = resolution_notes
    }

    const { data: report, error } = await supabase
      .from("content_reports")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Report update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Report update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
