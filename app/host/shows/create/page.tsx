"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { ShowForm } from "@/components/show-form"
import { ArrowLeft } from "lucide-react"

export default function CreateShowPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateShow = async (data: any) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Show created:", data)
    setIsLoading(false)
    // In a real app, you'd redirect here
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/host/shows">
          <Button variant="ghost" className="gap-2 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Shows
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold">Create a New Show</h1>
          <p className="text-muted-foreground mt-1">Set up your live shopping show and select products to feature</p>
        </div>

        <ShowForm onSubmit={handleCreateShow} isLoading={isLoading} />
      </div>
    </div>
  )
}
