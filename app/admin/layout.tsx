"use client"

import { useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldAlert, LayoutDashboard, Users, Video, Settings, Flag, UserCheck } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isAdmin, currentUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/admin")
    }
  }, [isAuthenticated, router])

  if (isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <ShieldAlert className="w-16 h-16 mx-auto text-destructive" />
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground">
                You need administrator privileges to access this area.
              </p>
              <div className="flex gap-2 justify-center pt-4">
                <Button variant="outline" asChild>
  <Link href="/">
    Go Home
  </Link>
</Button>
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
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Admin Sidebar */}
        <aside className="w-64 border-r bg-muted/30 hidden md:block">
          <div className="p-6">
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              Super Admin
            </h2>
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
  <Link href="/admin">

                  <LayoutDashboard className="w-4 h-4" />
                  Overview

  </Link>
</Button>
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
  <Link href="/admin/users">

                  <Users className="w-4 h-4" />
                  User Management

  </Link>
</Button>
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
  <Link href="/admin/sellers">

                  <UserCheck className="w-4 h-4" />
                  Seller Approval

  </Link>
</Button>
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
  <Link href="/admin/shows">

                  <Video className="w-4 h-4" />
                  Show Moderation

  </Link>
</Button>
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
  <Link href="/admin/moderation">

                  <Flag className="w-4 h-4" />
                  Content Reports

  </Link>
</Button>
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
  <Link href="/admin/settings">

                  <Settings className="w-4 h-4" />
                  Platform Settings

  </Link>
</Button>
            </nav>
          </div>
        </aside>
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
