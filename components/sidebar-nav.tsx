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
          variant={isActive ? "secondary" : "ghost"}
          className={cn("w-full justify-start gap-2 text-sm", level > 0 && "ml-4")}
          onClick={() => setIsOpen(false)}
        >
          {item.icon}
          <span className="flex-1 text-left">{item.title}</span>
          {item.badge && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{item.badge}</span>
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
          className="w-full justify-between"
          onClick={() => hasChildren && toggleCategory(category.title)}
        >
          <div className="flex items-center gap-2">
            {category.icon}
            <span className="text-sm font-medium">{category.title}</span>
            {category.badge && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                {category.badge}
              </span>
            )}
          </div>
          {hasChildren && <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />}
        </Button>

        {hasChildren && isExpanded && (
          <div className="ml-2 border-l border-border pl-2 space-y-1">
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
        className="fixed left-4 top-20 z-40 md:hidden"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border bg-background overflow-y-auto transition-transform duration-300 z-30",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="p-4 space-y-6">
          {/* Navigation Categories */}
          <div className="space-y-2">
            {filteredCategories.map((category) => (
              <CategoryButton key={category.title} category={category} />
            ))}
          </div>

          {/* User Section */}
          {isAuthenticated && (
            <div className="border-t pt-4 space-y-2">
              <div className="px-3 py-2 rounded-lg bg-secondary text-sm">
                <p className="font-medium">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                <p className="text-xs text-muted-foreground capitalize mt-1">Role: {currentUser?.role}</p>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
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
