import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

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

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const { data: balance } = await supabase
      .from("seller_balance")
      .select("stripe_account_id")
      .eq("seller_id", user.id)
      .single()

    if (balance?.stripe_account_id) {
      const loginLink = await stripe.accounts.createLoginLink(balance.stripe_account_id)
      return NextResponse.json({ url: loginLink.url, existing: true })
    }

    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      business_profile: {
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com",
      },
    })

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/seller?setup=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/seller?setup=complete`,
      type: "account_onboarding",
    })

    await supabase
      .from("seller_balance")
      .upsert({
        seller_id: user.id,
        stripe_account_id: account.id,
        available_balance: 0,
        pending_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
      })
      .eq("seller_id", user.id)

    return NextResponse.json({ url: accountLink.url, existing: false })
  } catch (error: any) {
    console.error("Stripe Connect error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
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

    const { data: balance } = await supabase
      .from("seller_balance")
      .select("stripe_account_id")
      .eq("seller_id", user.id)
      .single()

    if (!balance?.stripe_account_id) {
      return NextResponse.json({ connected: false })
    }

    const account = await stripe.accounts.retrieve(balance.stripe_account_id)

    return NextResponse.json({
      connected: true,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    })
  } catch (error: any) {
    console.error("Stripe account check error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
