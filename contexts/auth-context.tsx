"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

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
  const supabase = createClientComponentClient()

  // Load user from Supabase session on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
          if (profile) {
            setCurrentUser(profile)
          }
        }
      } catch (error) {
        console.error("[v0] Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        if (profile) {
          setCurrentUser(profile)
        }
      } else {
        setCurrentUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
        if (profile) {
          setCurrentUser(profile)
        }
      }

      return { success: true }
    } catch (error) {
      console.error("[v0] Login error:", error)
      return { success: false, error: "Login failed" }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "buyer" | "seller",
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        return { success: false, error: signUpError.message }
      }

      if (data?.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            name,
            email,
            role,
          },
        ])

        if (profileError) {
          return { success: false, error: profileError.message }
        }

        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
        if (profile) {
          setCurrentUser(profile)
        }
      }

      return { success: true }
    } catch (error) {
      console.error("[v0] Register error:", error)
      return { success: false, error: "Registration failed" }
    } finally {
      setIsLoading(false)
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

  const isSeller = currentUser?.role === "seller"
  const isAdmin = currentUser?.role === "admin"

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isSeller,
    isAdmin,
    login,
    register,
    logout,
    isLoading,
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
