"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Tv, ShoppingCart, User, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/cart-context"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { getCartItemCount } = useCart()
  const cartCount = getCartItemCount()

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Tv, label: "Live", href: "/live" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: ShoppingCart, label: "Cart", href: "/cart" },
    { icon: User, label: "Account", href: "/dashboard" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label === "Cart" && cartCount > 0 ? `Cart, ${cartCount} items` : item.label}
              className={cn(
                "flex flex-col items-center justify-center w-full py-3 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.label === "Cart" && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
