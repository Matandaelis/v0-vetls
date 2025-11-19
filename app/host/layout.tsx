"use client"

import { useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldAlert } from 'lucide-react'

export default function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isSeller, currentUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/host")
    }
  }, [isAuthenticated, router])

  if (isAuthenticated && !isSeller) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <ShieldAlert className="w-16 h-16 mx-auto text-destructive" />
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground">
                You need a seller account to access the host dashboard.
              </p>
              <p className="text-sm text-muted-foreground">
                Current account type: <span className="font-medium capitalize">{currentUser?.role}</span>
              </p>
              <div className="flex gap-2 justify-center pt-4">
                <Link href="/">
                  <Button variant="outline">Go Home</Button>
                </Link>
                <Link href="/register">
                  <Button>Create Seller Account</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {children}
    </div>
  )
}
