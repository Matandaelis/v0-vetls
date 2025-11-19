import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ProductProvider } from "@/contexts/product-context"
import { CartProvider } from "@/contexts/cart-context"
import { OrderProvider } from "@/contexts/order-context"
import { ShowProvider } from "@/contexts/show-context"
import { SearchProvider } from "@/contexts/search-context"
import { SocialProvider } from "@/contexts/social-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { AuthProvider } from "@/contexts/auth-context"
import { Suspense } from "react"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <ProductProvider>
              <CartProvider>
                <OrderProvider>
                  <ShowProvider>
                    <SearchProvider>
                      <SocialProvider>
                        <NotificationProvider>
                          {children}
                          <Analytics />
                        </NotificationProvider>
                      </SocialProvider>
                    </SearchProvider>
                  </ShowProvider>
                </OrderProvider>
              </CartProvider>
            </ProductProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}
