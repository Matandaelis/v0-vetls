"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useProducts } from "@/contexts/product-context"
import { useCart } from "@/contexts/cart-context"
import { useParams } from "next/navigation"
import { ShoppingCart, Star, Heart, Share2, Truck, RefreshCw } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function ProductPage() {
  const params = useParams()
  const { getProductById } = useProducts()
  const { addItem } = useCart()
  const product = getProductById(params.id as string)
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold">Product not found</h1>
          <Link href="/">
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem(product, quantity)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-secondary rounded-lg overflow-hidden h-96 md:h-full">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-3">
                {product.category}
              </span>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-muted-foreground">(128 reviews)</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-4xl font-bold text-primary mb-2">${product.price.toFixed(2)}</div>
              <p className="text-muted-foreground">
                {product.stock > 0 ? (
                  <span className="text-green-600">In Stock ({product.stock} available)</span>
                ) : (
                  <span className="text-destructive">Out of Stock</span>
                )}
              </p>
            </div>

            <p className="text-lg text-muted-foreground mb-6">{product.description}</p>

            <div className="bg-secondary p-4 rounded-lg mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Easy Returns</p>
                  <p className="text-sm text-muted-foreground">30-day money back guarantee</p>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-semibold">Quantity:</span>
              <div className="flex items-center border border-border rounded">
                <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  −
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isAdded ? "Added to Cart!" : "Add to Cart"}
              </Button>
              <Button size="lg" variant="outline" className="flex-1 bg-transparent">
                <Heart className="w-5 h-5 mr-2" />
                Save
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Seller Info */}
            <Card className="mt-8 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold">{product.sellerName}</h4>
                  <p className="text-sm text-muted-foreground">Trusted Seller • 4.8★</p>
                </div>
                <Button variant="outline">Contact Seller</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
