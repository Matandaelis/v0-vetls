## 2024-05-23 - Icon-Only Button Accessibility Pattern
**Learning:** In this Shadcn/Next.js codebase, icon-only buttons (Wishlist, Cart, Notifications, Mobile Menu) consistently lacked `aria-label` attributes, relying solely on visual icons which is inaccessible to screen readers.
**Action:** When working with Shadcn `Button` components with `size="icon"`, always check for and add an `aria-label` describing the action or destination.

## 2025-02-28 - Native Button Accessibility Oversight
**Learning:** Native HTML `<button>` elements used for micro-interactions (like "Like" or "Share") are often missed in accessibility audits compared to Shadcn `Button` components. They frequently lack `aria-label` when containing only icons.
**Action:** Scan for native `<button>` tags specifically when auditing accessibility, not just UI library components.

## 2025-03-01 - Micro-UX Scope and Broken Infrastructure
**Learning:** When attempting to fix accessibility in broken or incomplete components (missing file imports), creating the missing files (infrastructure fix) can bloat the PR and violate the "Micro-UX" scope (under 50 lines).
**Action:** Prioritize the accessibility fix (adding attributes) over fixing the broken infrastructure, unless explicitly asked to fix the build. Mention the missing files in the PR description but do not include them if they are large boilerplate.

## 2024-05-22 - Interactive Feedback Gap
**Learning:** "Shop" buttons in product lists lacked immediate visual feedback, causing user uncertainty. Simple state-based text changes ("Added!") are high-impact.
**Action:** When adding action buttons, always pair with a temporary success state or toast notification.

## 2024-05-22 - Tab Semantics
**Learning:** Tabs were implemented as simple button groups. While functional for mouse users, this pattern fails screen reader expectations for tab navigation.
**Action:** Use `role="tablist"`, `role="tab"`, and `aria-selected` for all segmented controls in the future.

## 2025-05-23 - Raw Input Accessibility Gaps
**Learning:** Found raw HTML `input` and `select` elements used for filtering (price, sort) instead of Shadcn UI components. These lacked associated labels and `aria-label` attributes, creating accessibility barriers.
**Action:** When auditing forms, specifically check for raw `input` tags mixed with UI components and replace them with accessible `Input` components where possible, or ensure they have `aria-label`.
