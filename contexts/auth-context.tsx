"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"

interface AuthContextType {
  currentUser: User | null
  isAuthenticated: boolean
  isSeller: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string, role: "buyer" | "seller") => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = "talkshop-auth"
const USERS_STORAGE_KEY = "talkshop-registered-users"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (savedAuth) {
      try {
        const user = JSON.parse(savedAuth)
        setCurrentUser(user)
      } catch (error) {
        console.error("Failed to load auth:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Check registered users first
    const registeredUsers = localStorage.getItem(USERS_STORAGE_KEY)
    let allUsers = [...mockUsers]
    
    if (registeredUsers) {
      try {
        const parsed = JSON.parse(registeredUsers)
        allUsers = [...allUsers, ...parsed]
      } catch (error) {
        console.error("Failed to parse registered users:", error)
      }
    }

    const user = allUsers.find((u) => u.email === email)
    
    if (!user) {
      return { success: false, error: "User not found" }
    }

    // For demo purposes, accept any password
    // In production, you'd verify against a hashed password
    setCurrentUser(user)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    
    return { success: true }
  }

  const register = async (name: string, email: string, password: string, role: "buyer" | "seller"): Promise<{ success: boolean; error?: string }> => {
    // Check if user already exists
    const registeredUsers = localStorage.getItem(USERS_STORAGE_KEY)
    let allUsers = [...mockUsers]
    
    if (registeredUsers) {
      try {
        const parsed = JSON.parse(registeredUsers)
        allUsers = [...allUsers, ...parsed]
      } catch (error) {
        console.error("Failed to parse registered users:", error)
      }
    }

    if (allUsers.find((u) => u.email === email)) {
      return { success: false, error: "Email already registered" }
    }

    // Create new user with role
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: "/placeholder-user.jpg",
      bio: "",
      followers: 0,
      following: 0,
      isFollowing: false,
      role,
    }

    // Save to registered users
    const updatedUsers = registeredUsers ? [...JSON.parse(registeredUsers), newUser] : [newUser]
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers))

    // Auto-login after registration
    setCurrentUser(newUser)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))

    return { success: true }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isSeller: currentUser?.role === "seller" || currentUser?.role === "admin",
    isAdmin: currentUser?.role === "admin",
    login,
    register,
    logout,
  }

  if (!isLoaded) {
    return null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
