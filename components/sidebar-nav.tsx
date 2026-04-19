"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  ShoppingCart,
  Zap,
  Package,
  Tv,
  User,
  Settings,
  BarChart3,
  Heart,
  MessageSquare,
  TrendingUp,
  Calendar,
  Award,
  HelpCircle,
  Shield,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavCategory {
  title: string
  icon: React.ReactNode
  href?: string
  badge?: string | number
  children?: NavItem[]
  requiresAuth?: boolean
  requiredRole?: "seller" | "admin"
}

interface NavItem {
  title: string
  href: string
  icon?: React.ReactNode
  badge?: string | number
}

export function SidebarNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["shopping", "discovery"])
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isSeller, isAdmin, currentUser, logout } = useAuth()

  const toggleCategory = (title: string) => {
    setExpandedCategories((prev) => (prev.includes(title) ? prev.filter((c) => c !== title) : [...prev, title]))
  }

  const navigateCategories: NavCategory[] = [
    {
      title: "Shopping",
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: "shop",
      children: [
        { title: "Live Shows", href: "/shows", icon: <Tv className="w-4 h-4" /> },
        { title: "Browse Products", href: "/products", icon: <Package className="w-4 h-4" /> },
        { title: "Categories", href: "/categories", icon: <Zap className="w-4 h-4" /> },
        { title: "My Cart", href: "/cart", icon: <ShoppingCart className="w-4 h-4" /> },
        { title: "Orders", href: "/dashboard", icon: <Package className="w-4 h-4" /> },
        { title: "Wishlist", href: "/wishlist", icon: <Heart className="w-4 h-4" /> },
      ],
      requiresAuth: false,
    },
    {
      title: "Discovery",
      icon: <TrendingUp className="w-5 h-5" />,
      children: [
        { title: "For You", href: "/feed", icon: <Home className="w-4 h-4" /> },
        { title: "Trending Now", href: "/trending", icon: <TrendingUp className="w-4 h-4" /> },
        { title: "New Arrivals", href: "/new", icon: <Zap className="w-4 h-4" /> },
        { title: "Best Sellers", href: "/bestsellers", icon: <Award className="w-4 h-4" /> },
        { title: "Live Events", href: "/live", icon: <Calendar className="w-4 h-4" /> },
      ],
      requiresAuth: false,
    },
    {
      title: "Community",
      icon: <MessageSquare className="w-5 h-5" />,
      children: [
        { title: "My Profile", href: `/profile/${currentUser?.id}`, icon: <User className="w-4 h-4" /> },
        { title: "My Follows", href: "/follows", icon: <User className="w-4 h-4" /> },
        { title: "Reviews & Ratings", href: "/reviews", icon: <Award className="w-4 h-4" /> },
        { title: "Messages", href: "/messages", icon: <MessageSquare className="w-4 h-4" /> },
      ],
      requiresAuth: true,
    },
    {
      title: "Creator Tools",
      icon: <Tv className="w-5 h-5" />,
      children: [
        { title: "Host Dashboard", href: "/host", icon: <BarChart3 className="w-4 h-4" /> },
        { title: "My Shows", href: "/seller/shows", icon: <Calendar className="w-4 h-4" /> },
        { title: "Product Inventory", href: "/seller/products", icon: <Package className="w-4 h-4" /> },
        { title: "Analytics", href: "/seller/analytics", icon: <BarChart3 className="w-4 h-4" /> },
        { title: "Earnings", href: "/seller/earnings", icon: <TrendingUp className="w-4 h-4" /> },
      ],
      requiresAuth: true,
      requiredRole: "seller",
    },
    {
      title: "Administration",
      icon: <Shield className="w-5 h-5" />,
      children: [
        { title: "Dashboard", href: "/admin", icon: <BarChart3 className="w-4 h-4" /> },
        { title: "Users Management", href: "/admin/users", icon: <User className="w-4 h-4" /> },
        { title: "Shows Management", href: "/admin/shows", icon: <Tv className="w-4 h-4" /> },
        { title: "Moderation", href: "/admin/moderation", icon: <Shield className="w-4 h-4" /> },
        { title: "Settings", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
      ],
      requiresAuth: true,
      requiredRole: "admin",
    },
    {
      title: "Support",
      icon: <HelpCircle className="w-5 h-5" />,
      children: [
        { title: "Help Center", href: "/help", icon: <HelpCircle className="w-4 h-4" /> },
        { title: "Contact Us", href: "/contact", icon: <MessageSquare className="w-4 h-4" /> },
        { title: "Privacy Policy", href: "/privacy", icon: <Shield className="w-4 h-4" /> },
        { title: "Terms of Service", href: "/terms", icon: <Shield className="w-4 h-4" /> },
      ],
      requiresAuth: false,
    },
  ]

  const filteredCategories = navigateCategories.filter((category) => {
    if (category.requiresAuth && !isAuthenticated) return false
    if (category.requiredRole === "seller" && !isSeller) return false
    if (category.requiredRole === "admin" && !isAdmin) return false
    return true
  })

  const handleLogout = () => {
    logout()
    router.push("/")
    setIsOpen(false)
  }

  const NavItem = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const isActive = pathname === item.href
    return (
      <Link href={item.href}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2.5 px-3 py-2 h-auto rounded-md text-sm font-medium transition-colors duration-200",
            isActive && "bg-accent text-accent-foreground font-semibold",
            !isActive && "text-foreground hover:bg-secondary",
            level > 0 && "ml-4 text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setIsOpen(false)}
        >
          {item.icon}
          <span className="flex-1 text-left">{item.title}</span>
          {item.badge && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-semibold">
              {item.badge}
            </span>
          )}
        </Button>
      </Link>
    )
  }

  const CategoryButton = ({ category }: { category: NavCategory }) => {
    const isExpanded = expandedCategories.includes(category.title)
    const hasChildren = category.children && category.children.length > 0

    return (
      <div key={category.title} className="space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between px-3 py-2.5 h-auto rounded-md font-semibold text-sm transition-colors duration-200",
            "text-foreground hover:bg-secondary"
          )}
          onClick={() => hasChildren && toggleCategory(category.title)}
        >
          <div className="flex items-center gap-2.5 flex-1">
            <span className="text-accent">{category.icon}</span>
            <span>{category.title}</span>
            {category.badge && (
              <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-bold ml-auto">
                {category.badge}
              </span>
            )}
          </div>
          {hasChildren && (
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-300 flex-shrink-0 ml-1",
                isExpanded && "rotate-180"
              )}
            />
          )}
        </Button>

        {hasChildren && isExpanded && (
          <div className="ml-3 border-l-2 border-border pl-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {category.children.map((item) => (
              <NavItem key={item.href} item={item} level={1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-20 z-40 md:hidden hover:bg-secondary transition-colors duration-200"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 sm:w-72 border-r border-border bg-background overflow-y-auto transition-all duration-300 ease-out z-30 shadow-lg md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="p-4 sm:p-6 space-y-8">
          {/* Navigation Categories */}
          <nav className="space-y-1">
            {filteredCategories.map((category) => (
              <CategoryButton key={category.title} category={category} />
            ))}
          </nav>

          {/* User Section */}
          {isAuthenticated && (
            <div className="border-t border-border pt-6 space-y-3">
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-secondary/60 border border-border/50">
                <div className="w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{currentUser?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                  <p className="text-xs text-accent font-medium capitalize mt-0.5">{currentUser?.role}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 font-medium"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          )}

          {/* Auth Buttons */}
          {!isAuthenticated && (
            <div className="border-t pt-4 space-y-2">
              <Link href="/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
