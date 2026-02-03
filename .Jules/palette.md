## 2024-05-23 - Icon-Only Button Accessibility Pattern
**Learning:** In this Shadcn/Next.js codebase, icon-only buttons (Wishlist, Cart, Notifications, Mobile Menu) consistently lacked `aria-label` attributes, relying solely on visual icons which is inaccessible to screen readers.
**Action:** When working with Shadcn `Button` components with `size="icon"`, always check for and add an `aria-label` describing the action or destination.

## 2024-05-24 - Dynamic & Floating Button Accessibility
**Learning:** Floating action buttons and dynamic inline actions (like chat message interactions) are common places where `aria-label` is missed.
**Action:** Specifically target `fixed` positioned buttons and map-generated buttons in lists for accessibility checks.
