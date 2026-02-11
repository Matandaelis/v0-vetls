## 2024-05-23 - Icon-Only Button Accessibility Pattern
**Learning:** In this Shadcn/Next.js codebase, icon-only buttons (Wishlist, Cart, Notifications, Mobile Menu) consistently lacked `aria-label` attributes, relying solely on visual icons which is inaccessible to screen readers.
**Action:** When working with Shadcn `Button` components with `size="icon"`, always check for and add an `aria-label` describing the action or destination.

## 2025-02-28 - Native Button Accessibility Oversight
**Learning:** Native HTML `<button>` elements used for micro-interactions (like "Like" or "Share") are often missed in accessibility audits compared to Shadcn `Button` components. They frequently lack `aria-label` when containing only icons.
**Action:** Scan for native `<button>` tags specifically when auditing accessibility, not just UI library components.

## 2025-05-30 - Missing UI Component Fallbacks
**Learning:** The project lacks certain Shadcn UI components (`Slider`, `Select`) but imports them as if they exist, causing build failures. The documented fallback is to use styled native HTML elements.
**Action:** Before using Shadcn components like `Slider` or `Select`, verify their existence in `components/ui/`. If missing, use accessible, styled native HTML elements (`<input type="range">`, `<select>`) as fallbacks.
