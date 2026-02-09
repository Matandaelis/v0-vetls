import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { mapProduct, type DbProduct } from "@/lib/db/mappers"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get("sellerId")
    const category = searchParams.get("category")

    let query = supabase.from("products").select(`
      *,
      seller:profiles!seller_id(username, display_name)
    `)

    if (sellerId) query = query.eq("seller_id", sellerId)
    if (category) query = query.eq("category", category)

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    // Map to UI models
    const products = (data || []).map((row: any) => {
      const sellerName = row.seller?.display_name || row.seller?.username || "Unknown Seller"
      return mapProduct(row as DbProduct, sellerName)
    })

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch products" },
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
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { error: "Missing required fields: name, price, category" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        seller_id: user.id,
        name: body.name,
        description: body.description || null,
        price: body.price,
        category: body.category,
        image_url: body.image_url || body.image || null,
        stock: body.stock || 0,
      })
      .select(`
        *,
        seller:profiles!seller_id(username, display_name)
      `)
      .single()

    if (error) throw error

    // Map to UI model
    const sellerName = data.seller?.display_name || data.seller?.username || "Unknown Seller"
    const product = mapProduct(data as any, sellerName)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 },
    )
  }
}
