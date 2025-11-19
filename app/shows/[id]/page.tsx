import { Header } from "@/components/header"
import { ShowInterface } from "@/components/show-interface"
import { mockShows, mockProducts } from "@/lib/mock-data"
import { notFound } from 'next/navigation'

export default async function ShowPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const show = mockShows.find((s) => s.id === id)
  
  if (!show) {
    notFound()
  }

  const getProductById = (productId: string) => mockProducts.find((p) => p.id === productId)
  const featuredProducts = show.products.map((productId) => getProductById(productId)).filter(Boolean) as any[]
  const isLive = show.status === "live"

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ShowInterface 
        show={show} 
        featuredProducts={featuredProducts} 
        isLive={isLive} 
      />
    </div>
  )
}
