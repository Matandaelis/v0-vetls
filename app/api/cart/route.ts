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
    const showId = searchParams.get("showId")

    let query = supabase.from("carts").select("*, cart_items(*, product_id(*))").eq("user_id", user.id)

    if (showId) query = query.eq("show_id", showId)

    const { data, error } = await query.single()

    if (error && error.code !== "PGRST116") throw error

    return NextResponse.json(data || null)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch cart" },
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

    const { showId, productId, quantity } = await request.json()

    // Get or create cart
    let { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .eq("show_id", showId)
      .single()

    if (cartError && cartError.code === "PGRST116") {
      const { data: newCart, error: createError } = await supabase
        .from("carts")
        .insert({ user_id: user.id, show_id: showId })
        .select()
        .single()

      if (createError) throw createError
      cart = newCart
    } else if (cartError) {
      throw cartError
    }

    // Add item to cart
    const { data, error } = await supabase
      .from("cart_items")
      .upsert({
        cart_id: cart.id,
        product_id: productId,
        quantity,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add to cart" },
      { status: 500 },
    )
  }
}
