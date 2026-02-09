/**
 * Zod validation schemas for API request bodies
 */

import { z } from "zod"

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  image_url: z.string().url().optional().or(z.literal("")),
  stock: z.number().int().min(0, "Stock must be non-negative"),
})

export const updateProductSchema = createProductSchema.partial()

export const createOrderSchema = z.object({
  total_amount: z.number().positive("Total amount must be positive"),
  status: z.enum(["pending", "processing", "completed", "failed", "refunded"]).optional(),
  payment_method: z.string().optional(),
  shipping_address: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ).min(1, "Order must contain at least one item"),
})

export const addToCartSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be positive").max(999),
})

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive("Quantity must be positive").max(999),
})

export const createPaymentIntentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3, "Currency must be 3 characters").default("usd"),
  description: z.string().optional(),
})

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  display_name: z.string().max(255).optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["viewer", "host"]).default("viewer"),
})
