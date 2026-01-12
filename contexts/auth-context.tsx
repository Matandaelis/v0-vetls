"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface AuthContextType {
  currentUser: User | null
  isAuthenticated: boolean
  isSeller: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    name: string,
    email: string,
    password: string,
    role: "buyer" | "seller",
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Load user from Supabase session on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
          if (profile) {
            setCurrentUser(profile as User)
          }
        }
      } catch (error) {
        console.error("[v0] Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
        if (profile) {
          setCurrentUser(profile as User)
        }
        return { success: true }
      }
      return { success: false, error: "Login failed" }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      console.error("[v0] Login error:", error)
      return { success: false, error: errorMessage }
    }
  }

  const register = async (name: string, email: string, password: string, role: "buyer" | "seller") => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (data?.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            name,
            email,
            role,
            created_at: new Date().toISOString(),
          },
        ])
        if (profileError) throw profileError
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
        if (profile) {
          setCurrentUser(profile as User)
        }
        return { success: true }
      }
      return { success: false, error: "Registration failed" }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      console.error("[v0] Register error:", error)
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setCurrentUser(null)
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isSeller: currentUser?.role === "seller",
        isAdmin: currentUser?.role === "admin",
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
