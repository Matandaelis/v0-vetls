import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") // 'buyer' or 'seller'

    // Get orders for the user
    let query = supabase.from("orders").select(`
      *,
      order_items(
        *,
        product:products(*)
      )
    `)

    // For buyers, get their own orders
    if (role === "buyer" || !role) {
      query = query.eq("user_id", user.id)
    } else if (role === "seller") {
      // For sellers, we need to filter order_items by seller_id
      // This is more complex - for now just return user's orders
      query = query.eq("user_id", user.id)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch orders" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.total_amount || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: total_amount, items" },
        { status: 400 }
      )
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: body.total_amount,
        status: body.status || "pending",
        payment_method: body.payment_method || null,
        shipping_address: body.shipping_address || null,
        notes: body.notes || null,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Insert order items
    const orderItems = body.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      seller_id: item.seller_id,
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 },
    )
  }
}
