import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { sendPayoutNotification } from "@/lib/email/sendgrid"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

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

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const { data: balance, error: balanceError } = await supabase
      .from("seller_balance")
      .select("*")
      .eq("seller_id", user.id)
      .single()

    if (balanceError || !balance) {
      return NextResponse.json({ error: "Balance not found" }, { status: 404 })
    }

    if (balance.available_balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    if (!balance.stripe_account_id) {
      return NextResponse.json(
        { error: "Stripe account not connected. Please complete onboarding." },
        { status: 400 },
      )
    }

    let transferId = null

    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        destination: balance.stripe_account_id,
        description: `Payout for seller ${user.id}`,
      })
      transferId = transfer.id
    } catch (stripeError: any) {
      console.error("Stripe transfer error:", stripeError)
      return NextResponse.json({ error: stripeError.message }, { status: 500 })
    }

    const { data: payout, error: payoutError } = await supabase
      .from("seller_payouts")
      .insert([
        {
          seller_id: user.id,
          amount,
          currency: "USD",
          status: "processing",
          stripe_transfer_id: transferId,
          stripe_account_id: balance.stripe_account_id,
        },
      ])
      .select()
      .single()

    if (payoutError) {
      console.error("Payout creation error:", payoutError)
      return NextResponse.json({ error: payoutError.message }, { status: 500 })
    }

    const { error: updateError } = await supabase
      .from("seller_balance")
      .update({
        available_balance: balance.available_balance - amount,
        total_withdrawn: balance.total_withdrawn + amount,
        updated_at: new Date().toISOString(),
      })
      .eq("seller_id", user.id)

    if (updateError) {
      console.error("Balance update error:", updateError)
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (profile && user.email) {
      await sendPayoutNotification(user.email, {
        amount,
        currency: "USD",
        payoutId: payout.id,
        status: "processing",
      })
    }

    return NextResponse.json(payout)
  } catch (error) {
    console.error("Payout request error:", error)
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

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: payouts, error } = await supabase
      .from("seller_payouts")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Payouts fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(payouts || [])
  } catch (error) {
    console.error("Payouts API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
