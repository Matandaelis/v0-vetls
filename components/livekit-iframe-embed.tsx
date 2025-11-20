"use client"

import { useEffect, useRef, useState } from "react"
import { Maximize2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface LiveKitIframeEmbedProps {
  roomName: string
  className?: string
}

export function LiveKitIframeEmbed({ roomName, className }: LiveKitIframeEmbedProps) {
  const [isEnlarged, setIsEnlarged] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleFullscreen = () => {
    setIsEnlarged(!isEnlarged)
  }

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEnlarged) {
        setIsEnlarged(false)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isEnlarged])

  return (
    <div
      id="livebox"
      ref={containerRef}
      className={cn(
        "relative transition-all duration-300 ease-in-out",
        isEnlarged ? "fixed inset-0 z-[10000] bg-white overflow-y-auto" : "",
        className,
      )}
    >
      {/* Header - Only visible when enlarged */}
      <div className={cn("justify-between p-2 px-4", isEnlarged ? "flex" : "hidden")}>
        <div>
          <a href="#" onClick={(e) => e.preventDefault()}>
            <img src="/placeholder-logo.svg" alt="logo" className="h-8" />
          </a>
        </div>
        <div
          className="text-base flex items-center cursor-pointer hover:text-gray-600"
          onClick={toggleFullscreen}
          title="Return to store"
        >
          <X className="w-6 h-6" />
        </div>
      </div>

      {/* Inner Container */}
      <div
        className={cn(
          "relative flex flex-col justify-center items-center mx-auto transition-all",
          isEnlarged ? "max-w-full h-[calc(100vh-60px)]" : "max-w-[1437px] xl:max-w-[1140px] aspect-video",
        )}
      >
        {/* Enlarge Button - Only visible when NOT enlarged */}
        {!isEnlarged && (
          <div
            className="bg-black/60 w-10 h-10 rounded-full text-white flex justify-center items-center cursor-pointer absolute -top-4 -right-4 hover:opacity-70 z-10"
            onClick={toggleFullscreen}
            title="Click to fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </div>
        )}

        <iframe
          width="100%"
          height="100%"
          src={`/iframe/live?room=${encodeURIComponent(roomName)}&username=Guest`}
          title="Live Market"
          scrolling="no"
          allowFullScreen
          id="lm-iframe"
          allow="clipboard-read; clipboard-write; camera; microphone; fullscreen"
          className="border-0 w-full h-full"
        />
      </div>

      {/* Click to fullscreen text - Only visible when NOT enlarged */}
      {!isEnlarged && (
        <p
          className="mt-2.5 underline cursor-pointer text-center hover:no-underline text-sm text-gray-700"
          onClick={toggleFullscreen}
          title="Click to fullscreen"
        >
          Click to fullscreen
        </p>
      )}
    </div>
  )
}
