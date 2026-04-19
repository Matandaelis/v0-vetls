import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="/products">Products</Link>
              </li>
              <li>
                <Link href="/category/electronics">Categories</Link>
              </li>
              <li>
                <Link href="/products?sort=price_asc">Deals</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Watch</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="/live">Live Shows</Link>
              </li>
              <li>
                <Link href="/shows">Upcoming</Link>
              </li>
              <li>
                <Link href="/shows?status=ended">Archive</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/help">Contact</Link>
              </li>
              <li>
                <Link href="/register?role=seller">Become a Seller</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
              <li>
                <Link href="/help">Help Center</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-80">
          <p>&copy; {new Date().getFullYear()} JB Live Shopping. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
