"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Feed page error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <p className="text-muted-foreground mb-6">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => reset()}>Try again</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Go home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
