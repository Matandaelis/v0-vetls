"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CarouselProps {
  children: React.ReactNode
  autoplay?: boolean
  autoplayDelay?: number
  showControls?: boolean
}

export function FeaturedCarousel({
  children,
  autoplay = false,
  autoplayDelay = 5000,
  showControls = true,
}: CarouselProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(true)

  const checkScroll = React.useCallback(() => {
    if (!containerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  const scroll = React.useCallback((direction: "left" | "right") => {
    if (!containerRef.current) return

    const scrollAmount = 400
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })

    setTimeout(checkScroll, 600)
  }, [checkScroll])

  React.useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [checkScroll])

  React.useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      scroll("right")
    }, autoplayDelay)

    return () => clearInterval(interval)
  }, [autoplay, autoplayDelay, scroll])

  return (
    <div className="relative group">
      {/* Left Button */}
      {showControls && canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </Button>
      )}

      {/* Container */}
      <div
        ref={containerRef}
        className="flex gap-8 overflow-x-auto scroll-smooth scrollbar-hide pb-4"
        onScroll={checkScroll}
      >
        {children}
      </div>

      {/* Right Button */}
      {showControls && canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </Button>
      )}
    </div>
  )
}

// Carousel Item Component
export function CarouselItem({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 ${className}`}>
      {children}
    </div>
  )
}
