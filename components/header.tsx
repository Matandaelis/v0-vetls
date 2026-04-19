"use client"

import type React from "react"
import Link from "next/link"
import { ShoppingCart, Search, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { NotificationPanel } from "@/components/notification-panel"
import { SidebarNav } from "@/components/sidebar-nav"

export function Header() {
  const { getCartItemCount } = useCart()
  const { currentUser, isAuthenticated, isSeller, isAdmin, logout } = useAuth()
  const cartCount = getCartItemCount()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background shadow-sm">
      <SidebarNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-bold text-lg sm:text-xl hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-bold text-sm">
              TS
            </div>
            <span className="hidden sm:inline text-foreground">TalkShop Live</span>
          </Link>

          {/* Search Bar - Center and prominent */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 items-center">
            <div className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input
                placeholder="Search products..."
                aria-label="Search products or shows"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent rounded-lg"
              />
            </div>
          </form>

          {/* Right Navigation */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden lg:flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Wishlist"
                className="hover:bg-secondary"
              >
                <Heart className="w-5 h-5" />
              </Button>
              <NotificationPanel />
            </div>

            {/* Cart Icon */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-secondary"
                aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-semibold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3 -mx-4 px-4">
          <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-2.5">
            <Search className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search..."
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
        </form>
      </div>
    </header>
  )
}
