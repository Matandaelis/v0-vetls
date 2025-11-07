"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Notification } from "@/lib/types"
import { mockNotifications } from "@/lib/mock-data"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const NOTIFICATIONS_STORAGE_KEY = "talkshop-notifications"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (error) {
        console.error("Failed to load notifications:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
    }
  }, [notifications, isLoaded])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const addNotification = (notificationData: Omit<Notification, "id" | "createdAt">) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}`,
      createdAt: new Date(),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
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
