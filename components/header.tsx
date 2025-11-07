"use client"

import type React from "react"

import Link from "next/link"
import { ShoppingCart, Search, Menu, Heart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { NotificationPanel } from "@/components/notification-panel"

export function Header() {
  const { getCartItemCount } = useCart()
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              TS
            </div>
            <span className="hidden sm:inline">TalkShop Live</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products or shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </form>

          {/* Right Navigation */}
          <div className="flex items-center gap-2">
            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Heart className="w-5 h-5" />
              </Button>
              <NotificationPanel />
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </div>

            {/* Cart Icon */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
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
