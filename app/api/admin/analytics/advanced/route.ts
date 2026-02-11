/**
 * Advanced analytics API endpoint
 * Provides comprehensive metrics for admin dashboard
 */

import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { metricsCollector } from "@/lib/performance/metrics"
import { trackApiLatency } from "@/lib/performance/metrics"

interface TimeSeriesData {
  timestamp: string
  value: number
}

interface AnalyticsResponse {
  overview: {
    totalUsers: number
    activeUsers: number
    totalRevenue: number
    totalOrders: number
    avgOrderValue: number
    conversionRate: number
  }
  timeSeries: {
    revenue: TimeSeriesData[]
    orders: TimeSeriesData[]
    users: TimeSeriesData[]
    viewers: TimeSeriesData[]
  }
  topProducts: Array<{
    id: string
    name: string
    revenue: number
    unitsSold: number
    conversionRate: number
  }>
  topShows: Array<{
    id: string
    title: string
    viewerCount: number
    revenue: number
    engagementRate: number
  }>
  topSellers: Array<{
    id: string
    name: string
    totalRevenue: number
    totalOrders: number
    averageRating: number
  }>
  geographics: Array<{
    country: string
    users: number
    revenue: number
  }>
  retention: {
    daily: number
    weekly: number
    monthly: number
  }
  performance: {
    apiLatency: number
    dbQueryTime: number
    cacheHitRate: number
  }
}

export async function GET(request: NextRequest) {
  const latency = trackApiLatency('/api/admin/analytics/advanced')
  
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {},
        },
      }
    )

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '30' // days
    const startDate = new Date(Date.now() - Number.parseInt(period) * 24 * 60 * 60 * 1000)

    // Execute queries in parallel for better performance
    const [
      usersResult,
      ordersResult,
      showsResult,
      productsResult,
      viewsResult,
    ] = await Promise.all([
      // Users data
      supabase
        .from('profiles')
        .select('id, created_at, last_sign_in_at')
        .gte('created_at', startDate.toISOString()),
      
      // Orders data
      supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          buyer_id,
          seller_id,
          order_items (
            product_id,
            quantity,
            price
          )
        `)
        .gte('created_at', startDate.toISOString()),
      
      // Shows data
      supabase
        .from('shows')
        .select(`
          id,
          title,
          status,
          start_time,
          viewer_count,
          show_analytics (
            total_conversions,
            total_revenue,
            engagement_rate
          )
        `)
        .gte('start_time', startDate.toISOString()),
      
      // Products data
      supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          seller_id,
          order_items (
            quantity,
            price
          )
        `),
      
      // Show views data
      supabase
        .from('show_views')
        .select('show_id, viewer_id, viewed_at, duration')
        .gte('viewed_at', startDate.toISOString()),
    ])

    // Process data
    const users = usersResult.data || []
    const orders = ordersResult.data || []
    const shows = showsResult.data || []
    const products = productsResult.data || []
    const views = viewsResult.data || []

    // Calculate overview metrics
    const totalUsers = users.length
    const activeUsers = users.filter(u => {
      const lastActive = u.last_sign_in_at ? new Date(u.last_sign_in_at) : null
      return lastActive && Date.now() - lastActive.getTime() < 7 * 24 * 60 * 60 * 1000
    }).length

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const totalOrders = orders.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const uniqueViewers = new Set(views.map(v => v.viewer_id)).size
    const conversionRate = uniqueViewers > 0 ? (totalOrders / uniqueViewers) * 100 : 0

    // Build time series data
    const revenueTimeSeries = buildTimeSeries(orders, 'created_at', order => order.total_amount || 0)
    const ordersTimeSeries = buildTimeSeries(orders, 'created_at', () => 1)
    const usersTimeSeries = buildTimeSeries(users, 'created_at', () => 1)
    const viewersTimeSeries = buildTimeSeries(views, 'viewed_at', () => 1)

    // Top products
    const topProducts = products
      .map(product => {
        const items = product.order_items || []
        const revenue = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
        const unitsSold = items.reduce((sum: number, item: any) => sum + item.quantity, 0)
        
        return {
          id: product.id,
          name: product.name,
          revenue,
          unitsSold,
          conversionRate: 0, // Would need view data
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Top shows
    const topShows = shows
      .map(show => {
        const analytics = show.show_analytics?.[0]
        return {
          id: show.id,
          title: show.title,
          viewerCount: show.viewer_count || 0,
          revenue: analytics?.total_revenue || 0,
          engagementRate: analytics?.engagement_rate || 0,
        }
      })
      .sort((a, b) => b.viewerCount - a.viewerCount)
      .slice(0, 10)

    // Top sellers
    const sellerStats = new Map<string, { revenue: number; orders: number }>()
    for (const order of orders) {
      if (order.seller_id) {
        const stats = sellerStats.get(order.seller_id) || { revenue: 0, orders: 0 }
        stats.revenue += order.total_amount || 0
        stats.orders += 1
        sellerStats.set(order.seller_id, stats)
      }
    }

    // Get seller profiles
    const sellerIds = Array.from(sellerStats.keys())
    const { data: sellers } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', sellerIds)

    const topSellers = (sellers || [])
      .map(seller => {
        const stats = sellerStats.get(seller.id)!
        return {
          id: seller.id,
          name: seller.full_name || 'Unknown',
          totalRevenue: stats.revenue,
          totalOrders: stats.orders,
          averageRating: 0, // Would need ratings data
        }
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    // Get performance metrics
    const apiMetrics = metricsCollector.getMetrics('api.latency')
    const dbMetrics = metricsCollector.getMetrics('db.query.latency')
    const cacheHitMetrics = metricsCollector.getMetrics('db.cache.hit')
    const cacheMissMetrics = metricsCollector.getMetrics('db.cache.miss')

    const cacheHitRate = 
      (cacheHitMetrics && cacheMissMetrics) 
        ? (cacheHitMetrics.sum / (cacheHitMetrics.sum + cacheMissMetrics.sum)) * 100 
        : 0

    const response: AnalyticsResponse = {
      overview: {
        totalUsers,
        activeUsers,
        totalRevenue,
        totalOrders,
        avgOrderValue,
        conversionRate,
      },
      timeSeries: {
        revenue: revenueTimeSeries,
        orders: ordersTimeSeries,
        users: usersTimeSeries,
        viewers: viewersTimeSeries,
      },
      topProducts,
      topShows,
      topSellers,
      geographics: [], // Would need geo data
      retention: {
        daily: 0,
        weekly: 0,
        monthly: 0,
      },
      performance: {
        apiLatency: apiMetrics?.avg || 0,
        dbQueryTime: dbMetrics?.avg || 0,
        cacheHitRate,
      },
    }

    latency.stop(200)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Advanced analytics error:', error)
    latency.stop(500)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

/**
 * Build time series data from records
 */
function buildTimeSeries(
  records: any[],
  dateField: string,
  valueExtractor: (record: any) => number
): TimeSeriesData[] {
  const dailyData = new Map<string, number>()

  for (const record of records) {
    const date = new Date(record[dateField])
    const dateStr = date.toISOString().split('T')[0]
    
    const currentValue = dailyData.get(dateStr) || 0
    dailyData.set(dateStr, currentValue + valueExtractor(record))
  }

  return Array.from(dailyData.entries())
    .map(([timestamp, value]) => ({ timestamp, value }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}
