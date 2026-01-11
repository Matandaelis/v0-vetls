import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {},
    },
  })

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Revenue trend
    const { data: revenueData } = await supabase
      .from("orders")
      .select("created_at, total_amount")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at")

    // Viewers trend
    const { data: viewerData } = await supabase
      .from("show_views")
      .select("viewed_at, count")
      .gte("viewed_at", thirtyDaysAgo)
      .order("viewed_at")

    // Top products
    const { data: productData } = await supabase
      .from("order_items")
      .select("product_id, quantity, products(name)")
      .gte("created_at", thirtyDaysAgo)

    // Traffic sources
    const { data: trafficData } = await supabase
      .from("analytics_events")
      .select("source")
      .gte("created_at", thirtyDaysAgo)

    // Aggregate metrics
    const totalRevenue = revenueData?.reduce((sum, row) => sum + (row.total_amount || 0), 0) || 0
    const totalViewers = viewerData?.reduce((sum, row) => sum + (row.count || 0), 0) || 0
    const totalOrders = revenueData?.length || 0

    const conversionRate = totalViewers > 0 ? (totalOrders / totalViewers) * 100 : 0

    return NextResponse.json({
      revenue:
        revenueData?.map((row) => ({
          date: new Date(row.created_at).toLocaleDateString(),
          amount: row.total_amount,
        })) || [],
      viewers:
        viewerData?.map((row) => ({
          date: new Date(row.viewed_at).toLocaleDateString(),
          count: row.count,
        })) || [],
      products: productData
        ? Object.values(
            productData.reduce((acc: any, item: any) => {
              const key = item.product_id
              if (!acc[key]) {
                acc[key] = { name: item.products?.name || "Unknown", sales: 0, revenue: 0 }
              }
              acc[key].sales += item.quantity
              return acc
            }, {}),
          )
        : [],
      traffic: trafficData
        ? Object.entries(
            trafficData.reduce((acc: any, item: any) => {
              acc[item.source] = (acc[item.source] || 0) + 1
              return acc
            }, {}),
          ).map(([source, value]) => ({ source, value }))
        : [],
      metrics: {
        totalRevenue,
        totalViewers,
        totalOrders,
        conversionRate,
      },
    })
  } catch (error) {
    console.error("Analytics fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
