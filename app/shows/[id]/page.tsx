import { Header } from "@/components/header"
import { ShowInterface } from "@/components/show-interface"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { mapShow, mapProduct, type DbShow, type DbProduct } from "@/lib/db/mappers"

export default async function ShowPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: showData, error: showError } = await supabase
    .from("shows")
    .select(`
      *,
      host:profiles!host_id(username, display_name, avatar_url)
    `)
    .eq("id", id)
    .single()

  if (showError || !showData) {
    notFound()
  }

  // Map to UI model
  const hostName = showData.host?.display_name || showData.host?.username || "Unknown Host"
  const hostAvatar = showData.host?.avatar_url || ""
  const show = mapShow(showData as any, hostName, hostAvatar)

  // For now, we'll load products separately since show.products is a simple array
  // In production, you might have a show_products join table
  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select(`
      *,
      seller:profiles!seller_id(username, display_name)
    `)
    .limit(10)

  if (productsError) {
    console.error("[v0] Error loading products:", productsError)
  }

  const products = (productsData || []).map((row: any) => {
    const sellerName = row.seller?.display_name || row.seller?.username || "Unknown Seller"
    return mapProduct(row as DbProduct, sellerName)
  })

  const isLive = show.status === "live"

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ShowInterface show={show} featuredProducts={products} isLive={isLive} />
    </div>
  )
}
