import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()

  return profile?.role === "admin"
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { reason } = body

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .update({
        verification_status: "unverified",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (profileError) {
      console.error("Profile update error:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    await supabase
      .from("host_verification")
      .upsert({
        host_id: params.id,
        verification_status: "rejected",
      })
      .eq("host_id", params.id)

    return NextResponse.json({ success: true, profile, reason })
  } catch (error) {
    console.error("Seller rejection error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
