import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { auctionId, bidAmount } = await request.json()
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: auction } = await supabase
      .from("auctions")
      .select("current_bid, auction_end")
      .eq("id", auctionId)
      .single()

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 })
    }

    if (new Date(auction.auction_end) < new Date()) {
      return NextResponse.json({ error: "Auction has ended" }, { status: 400 })
    }

    if (bidAmount <= auction.current_bid) {
      return NextResponse.json({ error: "Bid amount must be higher than current bid" }, { status: 400 })
    }

    const { error: bidError } = await supabase.from("bids").insert({
      auction_id: auctionId,
      bidder_id: user.id,
      bid_amount: bidAmount,
    })

    if (bidError) {
      return NextResponse.json({ error: bidError.message }, { status: 500 })
    }

    const { error: updateError } = await supabase
      .from("auctions")
      .update({
        current_bid: bidAmount,
        highest_bidder_id: user.id,
      })
      .eq("id", auctionId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Bid placed successfully",
    })
  } catch (error) {
    console.error("Error placing bid:", error)
    return NextResponse.json({ error: "Failed to place bid" }, { status: 500 })
  }
}
