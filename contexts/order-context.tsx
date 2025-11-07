"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { CartItem } from "@/lib/types"

export interface Order {
  id: string
  orderNumber: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  customerInfo: {
    email: string
    fullName: string
    phone: string
  }
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: Date
  status: "pending" | "processing" | "shipped" | "delivered"
}

interface OrderContextType {
  orders: Order[]
  createOrder: (order: Omit<Order, "id" | "orderNumber" | "createdAt">) => Order
  getOrderById: (id: string) => Order | undefined
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

const ORDERS_STORAGE_KEY = "talkshop-orders"

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders)
        setOrders(parsedOrders)
      } catch (error) {
        console.error("Failed to load orders:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
    }
  }, [orders, isLoaded])

  const createOrder = (orderData: Omit<Order, "id" | "orderNumber" | "createdAt">) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      orderNumber: `TS${Date.now().toString().slice(-8).toUpperCase()}`,
      createdAt: new Date(),
    }

    setOrders((prevOrders) => [newOrder, ...prevOrders])
    return newOrder
  }

  const getOrderById = (id: string) => {
    return orders.find((order) => order.id === id)
  }

  const value: OrderContextType = {
    orders,
    createOrder,
    getOrderById,
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
}
