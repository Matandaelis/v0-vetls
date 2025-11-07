"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { SearchResult } from "@/lib/types"

interface SearchResultCardProps {
  result: SearchResult
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  const isProduct = result.type === "product"
  const href = isProduct ? `/products/${result.id}` : `/shows/${result.id}`

  return (
    <Link href={href}>
      <div className="flex gap-4 p-4 border rounded-lg hover:shadow-lg hover:border-primary transition-all cursor-pointer bg-card">
        <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
          <img src={result.image || "/placeholder.svg"} alt={result.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground truncate">{result.title}</h3>
            <Badge variant={isProduct ? "default" : "secondary"}>{result.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{result.description}</p>
          <div className="flex gap-2 flex-wrap">
            {result.metadata?.category && (
              <Badge variant="outline" className="text-xs">
                {result.metadata.category}
              </Badge>
            )}
            {isProduct && result.metadata?.price && (
              <Badge variant="outline" className="text-xs">
                ${result.metadata.price.toFixed(2)}
              </Badge>
            )}
            {!isProduct && result.metadata?.status && (
              <Badge variant="outline" className="text-xs capitalize">
                {result.metadata.status}
              </Badge>
            )}
            {!isProduct && result.metadata?.viewerCount && (
              <Badge variant="outline" className="text-xs">
                {result.metadata.viewerCount.toLocaleString()} watching
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
