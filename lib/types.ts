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
  streamId?: string
  streamUrl?: string
  rtmpUrl?: string
  hlsUrl?: string
  dashUrl?: string
  tokenId?: string
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
  role: "buyer" | "seller" | "admin"
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

export interface StreamingMetrics {
  totalViewers: number
  bitrate: number
  fps: number
  timestamp: Date
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

export interface Clip {
  id: string
  thumbnail: string
  videoUrl: string
  title: string
  hostName: string
  hostAvatar: string
  productId: string
  views: number
  likes: number
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
