"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, BarChart } from 'lucide-react'

const mockProducts = [
  { id: 1, name: "Wireless Headphones", price: 79.99, stock: 45, sales: 234, featured: true },
  { id: 2, name: "Smartwatch", price: 199.99, stock: 12, sales: 89, featured: true },
  { id: 3, name: "Phone Case", price: 29.99, stock: 156, sales: 512, featured: false },
  { id: 4, name: "USB-C Cable", price: 14.99, stock: 0, sales: 234, featured: false },
]

export function ProductManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Product Inventory</h3>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {mockProducts.map((product) => (
          <Card key={product.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{product.name}</h4>
                  {product.featured && <Badge className="bg-primary text-xs">Featured</Badge>}
                  {product.stock === 0 && <Badge variant="destructive" className="text-xs">Out of Stock</Badge>}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>${product.price.toFixed(2)}</span>
                  <span>Stock: {product.stock}</span>
                  <span>Sales: {product.sales}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost">
                  <BarChart className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
