import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: balance, error } = await supabase
      .from("seller_balance")
      .select("*")
      .eq("seller_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Balance fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!balance) {
      const { data: newBalance, error: createError } = await supabase
        .from("seller_balance")
        .insert([
          {
            seller_id: user.id,
            available_balance: 0,
            pending_balance: 0,
            total_earned: 0,
            total_withdrawn: 0,
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error("Balance creation error:", createError)
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      return NextResponse.json(newBalance)
    }

    return NextResponse.json(balance)
  } catch (error) {
    console.error("Balance API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
