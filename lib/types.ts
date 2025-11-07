export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  sellerId: string
  sellerName: string
  category: string
  stock: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Show {
  id: string
  title: string
  description: string
  image: string
  startTime: Date
  endTime?: Date
  hostId: string
  hostName: string
  hostAvatar: string
  featured: boolean
  viewerCount?: number
  status: "scheduled" | "live" | "ended"
  category: string
  tags: string[]
  products: string[] // Array of product IDs featured in show
  maxViewers: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  bio?: string
  followers: number
  following: number
  isFollowing?: boolean
}

export interface ShowComment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: Date
  likes: number
}

export interface ViewerMetrics {
  totalViewers: number
  peakViewers: number
  averageWatchTime: number
  engagementRate: number
}

export interface SearchFilters {
  query?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  sortBy?: "relevance" | "price_asc" | "price_desc" | "newest" | "popularity"
}

export interface SearchResult {
  type: "product" | "show"
  id: string
  title: string
  description: string
  image: string
  metadata?: Record<string, any>
}

export interface Rating {
  id: string
  userId: string
  userName: string
  userAvatar: string
  score: 1 | 2 | 3 | 4 | 5
  title: string
  comment: string
  productId?: string
  showId?: string
  createdAt: Date
  helpful: number
}

export interface Notification {
  id: string
  type: "follow" | "show_starting" | "restock" | "rating" | "comment"
  title: string
  message: string
  userId: string
  targetId?: string
  read: boolean
  createdAt: Date
}

export interface UserFollow {
  userId: string
  followingIds: string[]
  followers: string[]
}

export interface AnalyticsData {
  showId: string
  date: Date
  viewCount: number
  peakViewers: number
  averageWatchTime: number
  engagement: number
  salesGenerated: number
  conversions: number
}

export interface HostMetrics {
  hostId: string
  totalShows: number
  totalViewers: number
  totalSales: number
  averageViewersPerShow: number
  totalRevenue: number
  topProduct: string
  conversionRate: number
}

export interface ProductAnalytics {
  productId: string
  name: string
  showsFeatures: number
  viewCount: number
  clicks: number
  purchases: number
  revenue: number
}

export interface RevenueReport {
  period: "daily" | "weekly" | "monthly"
  startDate: Date
  endDate: Date
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  topProducts: ProductAnalytics[]
}
