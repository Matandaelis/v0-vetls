"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Notification } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  addNotification: (notification: Omit<Notification, "id" | "created_at">) => Promise<void>
  loadNotifications: () => Promise<void>
  isLoading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadNotifications()

    // Subscribe to new notifications in real-time
    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          console.log("[v0] Notification change:", payload)
          loadNotifications()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const { data: session } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error("[v0] Error loading notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id)
      if (error) throw error
      await loadNotifications()
    } catch (error) {
      console.error("[v0] Error marking notification as read:", error)
      throw error
    }
  }

  const markAllAsRead = async () => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.user) return

      const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", session.user.id)

      if (error) throw error
      await loadNotifications()
    } catch (error) {
      console.error("[v0] Error marking all notifications as read:", error)
      throw error
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id)
      if (error) throw error
      await loadNotifications()
    } catch (error) {
      console.error("[v0] Error deleting notification:", error)
      throw error
    }
  }

  const addNotification = async (notificationData: Omit<Notification, "id" | "created_at">) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.user) return

      const { error } = await supabase.from("notifications").insert([
        {
          ...notificationData,
          user_id: session.user.id,
        },
      ])

      if (error) throw error
      await loadNotifications()
    } catch (error) {
      console.error("[v0] Error adding notification:", error)
      throw error
    }
  }

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    loadNotifications,
    isLoading,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
