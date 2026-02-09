/**
 * Database mappers to convert snake_case Supabase rows to camelCase UI models
 * and handle type conversions (dates, defaults, etc.)
 */

import type { Product, Show, User } from "@/lib/types"

// Database row types (snake_case as stored in Supabase)
export interface DbProduct {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  stock: number
  seller_id: string
  sold?: number
  rating?: number
  rating_count?: number
  view_count?: number
  sku?: string | null
  is_featured?: boolean
  created_at?: string
  updated_at?: string
}

export interface DbShow {
  id: string
  title: string
  description: string | null
  category: string
  thumbnail_url: string | null
  start_time: string
  end_time: string | null
  status: "scheduled" | "live" | "ended"
  host_id: string
  viewer_count?: number
  max_viewers?: number
  room_name?: string | null
  is_featured?: boolean
  view_count?: number
  rating?: number
  rating_count?: number
  revenue?: number
  created_at?: string
  updated_at?: string
}

export interface DbProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: "viewer" | "host" | "admin"
  followers_count?: number
  following_count?: number
  total_sales?: number
  rating?: number
  verification_status?: "unverified" | "pending" | "verified"
  created_at?: string
  updated_at?: string
}

export interface DbOrder {
  id: string
  user_id: string
  total_amount: number
  status: "pending" | "processing" | "completed" | "failed" | "refunded"
  payment_method?: string | null
  shipping_address?: string | null
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface DbCartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  added_at?: string
}

/**
 * Map a Supabase product row to the UI Product model
 */
export function mapProduct(dbProduct: DbProduct, sellerName?: string): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || "",
    price: Number(dbProduct.price),
    image: dbProduct.image_url || "",
    category: dbProduct.category,
    stock: dbProduct.stock,
    sellerId: dbProduct.seller_id,
    sellerName: sellerName || "Unknown Seller",
  }
}

/**
 * Map a Supabase show row to the UI Show model
 */
export function mapShow(dbShow: DbShow, hostName?: string, hostAvatar?: string): Show {
  return {
    id: dbShow.id,
    title: dbShow.title,
    description: dbShow.description || "",
    image: dbShow.thumbnail_url || "",
    startTime: new Date(dbShow.start_time),
    endTime: dbShow.end_time ? new Date(dbShow.end_time) : undefined,
    status: dbShow.status,
    category: dbShow.category,
    hostId: dbShow.host_id,
    hostName: hostName || "Unknown Host",
    hostAvatar: hostAvatar || "",
    viewerCount: dbShow.viewer_count,
    maxViewers: dbShow.max_viewers || 0,
    roomName: dbShow.room_name || undefined,
    featured: dbShow.is_featured || false,
    tags: [], // Tags would need to be joined from a separate table if implemented
    products: [], // Products would need to be joined from a separate table if implemented
  }
}

/**
 * Map a Supabase profile row to the UI User model
 * Handles role mapping: viewer/host/admin (DB) -> buyer/seller/admin (UI)
 */
export function mapProfile(dbProfile: DbProfile, email?: string): User {
  // Map database roles to UI roles
  let uiRole: "buyer" | "seller" | "admin"
  switch (dbProfile.role) {
    case "admin":
      uiRole = "admin"
      break
    case "host":
      uiRole = "seller"
      break
    case "viewer":
    default:
      uiRole = "buyer"
      break
  }

  return {
    id: dbProfile.id,
    name: dbProfile.display_name || dbProfile.username,
    email: email || "",
    avatar: dbProfile.avatar_url || "",
    bio: dbProfile.bio || undefined,
    role: uiRole,
    followers: dbProfile.followers_count || 0,
    following: dbProfile.following_count || 0,
  }
}

/**
 * Map UI role back to database role
 */
export function mapRoleToDb(uiRole: "buyer" | "seller" | "admin"): "viewer" | "host" | "admin" {
  switch (uiRole) {
    case "admin":
      return "admin"
    case "seller":
      return "host"
    case "buyer":
    default:
      return "viewer"
  }
}

/**
 * Convert a UI Product to database format for insert/update
 */
export function productToDb(product: Omit<Product, "id" | "sellerName">): Partial<DbProduct> {
  return {
    name: product.name,
    description: product.description || null,
    price: product.price,
    category: product.category,
    image_url: product.image || null,
    stock: product.stock,
    seller_id: product.sellerId,
  }
}

/**
 * Convert a UI Show to database format for insert/update
 */
export function showToDb(show: Partial<Show>): Partial<DbShow> {
  const dbShow: Partial<DbShow> = {}
  
  if (show.title) dbShow.title = show.title
  if (show.description) dbShow.description = show.description
  if (show.category) dbShow.category = show.category
  if (show.image) dbShow.thumbnail_url = show.image
  if (show.startTime) dbShow.start_time = show.startTime.toISOString()
  if (show.endTime) dbShow.end_time = show.endTime.toISOString()
  if (show.status) dbShow.status = show.status
  if (show.hostId) dbShow.host_id = show.hostId
  if (show.viewerCount !== undefined) dbShow.viewer_count = show.viewerCount
  if (show.maxViewers !== undefined) dbShow.max_viewers = show.maxViewers
  if (show.roomName) dbShow.room_name = show.roomName
  if (show.featured !== undefined) dbShow.is_featured = show.featured

  return dbShow
}
