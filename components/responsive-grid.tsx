"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: {
    mobile: number
    tablet: number
    desktop: number
  }
  gap?: string
  className?: string
}

export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "gap-4",
  className,
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        "grid",
        `grid-cols-${columns.mobile}`,
        `sm:grid-cols-${columns.tablet}`,
        `lg:grid-cols-${columns.desktop}`,
        gap,
        className,
      )}
    >
      {children}
    </div>
  )
}
