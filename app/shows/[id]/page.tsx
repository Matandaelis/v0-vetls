import { Header } from "@/components/header"
import { ShowInterface } from "@/components/show-interface"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function ShowPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: show, error: showError } = await supabase.from("shows").select("*").eq("id", id).single()

  if (showError || !show) {
    notFound()
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .in("id", show.products || [])

  if (productsError) {
    console.error("[v0] Error loading products:", productsError)
  }

  const isLive = show.status === "live"

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ShowInterface show={show} featuredProducts={products || []} isLive={isLive} />
    </div>
  )
}
