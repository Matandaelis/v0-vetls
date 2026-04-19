"use client"

import type React from "react"
import Link from "next/link"
import { ShoppingCart, Search, Menu, LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { NotificationPanel } from "@/components/notification-panel"
import { SidebarNav } from "@/components/sidebar-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" role="navigation" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Logo - Expanded */}
          <Link 
            href="/" 
            className="flex items-center gap-2.5 font-bold text-sm sm:text-base lg:text-lg hover:opacity-80 transition-opacity duration-200 flex-shrink-0"
          >
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
              TS
            </div>
            <span className="hidden sm:inline text-foreground font-semibold whitespace-nowrap">TalkShop Live</span>
          </Link>

          {/* Center: Search Bar - Only desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8 items-center">
            <div className="w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input
                placeholder="Search products, shows, creators..."
                aria-label="Search products or shows"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent rounded-lg text-sm"
              />
            </div>
          </form>

          {/* Right: Navigation Items */}
          <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-2 flex-shrink-0">
            {/* About Link - Desktop only */}
            <Link href="/about" className="hidden lg:block">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium hover:bg-secondary transition-colors duration-200"
              >
                About
              </Button>
            </Link>

            {/* Notification - Desktop only */}
            <div className="hidden lg:block">
              <NotificationPanel />
            </div>

            {/* Cart Icon */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-secondary transition-colors duration-200 text-foreground"
                aria-label={cartCount > 0 ? `Cart with ${cartCount} items` : "Shopping cart"}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu - Authenticated only */}
            {isAuthenticated && currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-secondary transition-colors duration-200"
                    aria-label={`Account menu for ${currentUser.name}`}
                  >
                    <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-semibold text-xs">
                      {currentUser.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-semibold text-sm">
                    {currentUser.name}
                  </DropdownMenuLabel>
                  <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                    {currentUser.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {(isSeller || isAdmin) && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Sign in button - Not authenticated */
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold transition-colors duration-200"
                >
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="md:hidden pb-3 -mx-4 px-4">
          <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-2.5">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
            <Input
              placeholder="Search..."
              aria-label="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-sm"
            />
          </div>
        </form>
      </nav>
    </header>
  )
}
