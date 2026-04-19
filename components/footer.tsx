"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { useState } from "react"

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setIsSubscribed(true)
      setEmail("")
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="border-b border-white/10 py-12">
          <div className="max-w-md">
            <h3 className="text-xl font-bold mb-2">Subscribe to our Newsletter</h3>
            <p className="text-white/70 text-sm mb-4">
              Get the latest updates on live shows, exclusive deals, and more.
            </p>
            <form onSubmit={handleNewsletterSignup} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 flex-1"
                required
              />
              <Button 
                type="submit"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              >
                {isSubscribed ? "✓" : "Sign Up"}
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-bold text-sm">
                TS
              </div>
              <span className="font-bold text-lg">TalkShop Live</span>
            </div>
            <p className="text-sm text-white/70 mb-4">
              The modern live shopping platform. Watch, shop, and save.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Shop</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/category/electronics" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/products?sort=price_asc" className="hover:text-white transition-colors">
                  Deals & Offers
                </Link>
              </li>
              <li>
                <Link href="/products?new=true" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Watch */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Watch</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="/live" className="hover:text-white transition-colors">
                  Live Shows
                </Link>
              </li>
              <li>
                <Link href="/shows" className="hover:text-white transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link href="/shows?status=ended" className="hover:text-white transition-colors">
                  Archives
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/register?role=seller" className="hover:text-white transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="hover:text-white transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6 text-center text-sm text-white/60">
          <p>&copy; {new Date().getFullYear()} TalkShop Live. All rights reserved. Handcrafted with care.</p>
        </div>
      </div>
    </footer>
  )
}
