"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Tv, ShoppingCart, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Tv, label: "Live", href: "/live" },
    { icon: ShoppingCart, label: "Cart", href: "/cart" },
    { icon: User, label: "Account", href: "/dashboard" },
  ]

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-inset-bottom"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-3 px-2 min-h-[60px] transition-colors duration-200 gap-1 text-center",
                isActive
                  ? "text-accent font-semibold border-t-2 border-accent bg-accent/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("w-6 h-6 transition-transform duration-200", isActive && "scale-110")} />
              <span className={cn("text-xs font-medium truncate", isActive && "text-accent")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
