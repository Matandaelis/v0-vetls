import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/send"
import { emailTemplates } from "@/lib/email/templates"
import { createServerClient } from "@supabase/ssr"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, recipientId, data } = body

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    })

    // Get user email
    const { data: user } = await supabase.from("profiles").select("email").eq("id", recipientId).single()

    if (!user?.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 404 })
    }

    let emailContent
    switch (type) {
      case "order_confirmation":
        emailContent = emailTemplates.orderConfirmation(data)
        break
      case "live_stream_notification":
        emailContent = emailTemplates.liveStreamNotification(data)
        break
      case "auction_outbid":
        emailContent = emailTemplates.auctionOutbid(data)
        break
      case "auction_won":
        emailContent = emailTemplates.auctionWon(data)
        break
      case "loyalty_reward":
        emailContent = emailTemplates.loyaltyRewardEarned(data)
        break
      default:
        return NextResponse.json({ error: "Unknown notification type" }, { status: 400 })
    }

    await sendEmail(user.email, emailContent.subject, emailContent.html)

    // Store notification in database
    await supabase.from("notifications").insert({
      user_id: recipientId,
      type,
      content: JSON.stringify(data),
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notification error:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
