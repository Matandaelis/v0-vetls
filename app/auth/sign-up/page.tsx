"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [accountType, setAccountType] = useState<"viewer" | "seller">("viewer")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            account_type: accountType,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        setSuccess(true)
        setTimeout(() => {
          if (accountType === "seller") {
            router.push("/onboarding/seller")
          } else {
            router.push("/")
          }
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join our streaming marketplace</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-destructive/10 border border-destructive rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700">Account created! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>

          <div>
            <Label>Account Type</Label>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-3 p-3 border border-input rounded-lg cursor-pointer hover:bg-secondary/50">
                <input
                  type="radio"
                  name="accountType"
                  value="viewer"
                  checked={accountType === "viewer"}
                  onChange={(e) => setAccountType(e.target.value as "viewer" | "seller")}
                />
                <div>
                  <p className="font-semibold">Viewer</p>
                  <p className="text-xs text-muted-foreground">Browse and purchase items</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-input rounded-lg cursor-pointer hover:bg-secondary/50">
                <input
                  type="radio"
                  name="accountType"
                  value="seller"
                  checked={accountType === "seller"}
                  onChange={(e) => setAccountType(e.target.value as "viewer" | "seller")}
                />
                <div>
                  <p className="font-semibold">Seller/Creator</p>
                  <p className="text-xs text-muted-foreground">Host streams and sell products</p>
                </div>
              </label>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} size="lg" className="w-full">
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </form>
      </Card>
    </div>
  )
}
