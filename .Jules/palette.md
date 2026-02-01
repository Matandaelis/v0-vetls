## 2024-05-23 - Icon-Only Button Accessibility Pattern
**Learning:** In this Shadcn/Next.js codebase, icon-only buttons (Wishlist, Cart, Notifications, Mobile Menu) consistently lacked `aria-label` attributes, relying solely on visual icons which is inaccessible to screen readers.
**Action:** When working with Shadcn `Button` components with `size="icon"`, always check for and add an `aria-label` describing the action or destination.

## 2025-02-19 - Maintaining Accessibility in Mock/Unused Components
**Learning:** Some components (like `LiveShowPlayer`) may appear unused or be mock implementations but still exist in the codebase. These should still adhere to accessibility standards to ensure future integration or usage is accessible by default.
**Action:** When identifying UX patterns, do not skip components just because they don't appear in the main flow; apply fixes consistently across the codebase.
