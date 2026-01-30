## 2024-05-23 - Icon-Only Button Accessibility Pattern
**Learning:** In this Shadcn/Next.js codebase, icon-only buttons (Wishlist, Cart, Notifications, Mobile Menu) consistently lacked `aria-label` attributes, relying solely on visual icons which is inaccessible to screen readers.
**Action:** When working with Shadcn `Button` components with `size="icon"`, always check for and add an `aria-label` describing the action or destination.

## 2024-05-23 - Video Player Control Accessibility
**Learning:** Video player overlay controls (Play, Mute, Like) are high-impact interactive elements that often get missed in accessibility sweeps. They need `aria-label` and often `aria-pressed` for toggle states.
**Action:** Ensure all media player controls have descriptive labels and state indicators (like `aria-pressed` or dynamic labels).
