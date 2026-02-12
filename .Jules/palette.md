## 2024-05-23 - Icon-Only Button Accessibility Pattern
**Learning:** In this Shadcn/Next.js codebase, icon-only buttons (Wishlist, Cart, Notifications, Mobile Menu) consistently lacked `aria-label` attributes, relying solely on visual icons which is inaccessible to screen readers.
**Action:** When working with Shadcn `Button` components with `size="icon"`, always check for and add an `aria-label` describing the action or destination.

## 2025-02-28 - Native Button Accessibility Oversight
**Learning:** Native HTML `<button>` elements used for micro-interactions (like "Like" or "Share") are often missed in accessibility audits compared to Shadcn `Button` components. They frequently lack `aria-label` when containing only icons.
**Action:** Scan for native `<button>` tags specifically when auditing accessibility, not just UI library components.

## 2025-03-03 - Missing Shadcn Components Fallback
**Learning:** The `components/ui` directory is missing `slider.tsx` and `select.tsx`. Components that attempt to import them (like `livekit-player.tsx`) will break the build.
**Action:** Replace missing Shadcn components with accessible, styled native HTML elements (`<input type="range">`, `<select>`) when encountered. Ensure `aria-label` is added as native elements don't have built-in accessibility props like Shadcn components might.
