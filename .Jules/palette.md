## 2024-05-23 - Icon-Only Button Accessibility Pattern
**Learning:** In this Shadcn/Next.js codebase, icon-only buttons (Wishlist, Cart, Notifications, Mobile Menu) consistently lacked `aria-label` attributes, relying solely on visual icons which is inaccessible to screen readers.
**Action:** When working with Shadcn `Button` components with `size="icon"`, always check for and add an `aria-label` describing the action or destination.

## 2025-02-28 - Native Button Accessibility Oversight
**Learning:** Native HTML `<button>` elements used for micro-interactions (like "Like" or "Share") are often missed in accessibility audits compared to Shadcn `Button` components. They frequently lack `aria-label` when containing only icons.
**Action:** Scan for native `<button>` tags specifically when auditing accessibility, not just UI library components.

## 2025-03-01 - Micro-UX Scope and Broken Infrastructure
**Learning:** When attempting to fix accessibility in broken or incomplete components (missing file imports), creating the missing files (infrastructure fix) can bloat the PR and violate the "Micro-UX" scope (under 50 lines).
**Action:** Prioritize the accessibility fix (adding attributes) over fixing the broken infrastructure, unless explicitly asked to fix the build. Mention the missing files in the PR description but do not include them if they are large boilerplate.

## 2026-02-19 - Semantic Tab Interface Pattern
**Learning:** Custom tab implementations using `useState` for rendering content often lack semantic structure (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`), making them inaccessible to screen readers who cannot perceive the visual change.
**Action:** When encountering custom tab components, always verify and add the ARIA roles and attributes to connect the tab buttons to their respective content panels using `id` and `aria-controls`.
