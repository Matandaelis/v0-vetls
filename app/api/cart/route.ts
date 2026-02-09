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

    // Get cart items for the user
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        product:products(
          *,
          seller:profiles!seller_id(username, display_name)
        )
      `)
      .eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json(data || [])
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

    const { product_id, quantity } = await request.json()

    // Validate required fields
    if (!product_id || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields: product_id, quantity" },
        { status: 400 }
      )
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      )
    }

    // Add or update cart item
    const { data, error } = await supabase
      .from("cart_items")
      .upsert(
        {
          user_id: user.id,
          product_id,
          quantity,
        },
        {
          onConflict: "user_id,product_id",
        }
      )
      .select(`
        *,
        product:products(
          *,
          seller:profiles!seller_id(username, display_name)
        )
      `)
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

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("product_id")

    if (!productId) {
      return NextResponse.json(
        { error: "Missing product_id parameter" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove from cart" },
      { status: 500 },
    )
  }
}
