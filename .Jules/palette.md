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

## 2025-03-05 - Semantic Form Grouping and Missing ARIA Labels on Native Inputs
**Learning:** Native form inputs (like `select` and `input type="number"`) used for filtering without visible `<label>` elements were missing programmatic associations, making them inaccessible to screen readers. Furthermore, related filters were grouped visually using `<div>` and `<h3>` tags instead of semantically grouping them with `<fieldset>` and `<legend>`.
**Action:** When auditing forms and filter panels, replace visual `<div>`/`<h3>` grouping with semantic `<fieldset>`/`<legend>` structures. Ensure all inputs (including Shadcn `<Input>` components and native elements) without visible text labels include an `aria-label` attribute.

## 2025-03-05 - Shopping Cart Accessibility Requirements
**Learning:** Icon-only buttons for quantity manipulation and removal in list contexts (like a shopping cart) are completely inaccessible without specific context. A generic "Increase" label is insufficient when there are multiple items; it needs to be "Increase quantity of [Product Name]". Furthermore, dynamic text that updates on the client without a page reload (like the quantity counter itself) requires `aria-live="polite"` and `aria-atomic="true"` so screen readers proactively announce the changed value. Finally, decorative icons inside these buttons should be explicitly hidden with `aria-hidden="true"` to prevent redundant reading.
**Action:** When auditing list items or repeating groups with icon-only controls, ensure the `aria-label` incorporates the item's context (e.g. name or ID). Always wrap dynamically updated text nodes with `aria-live="polite"`. Add `aria-hidden="true"` to decorative `<svg>` components inside labeled buttons.
## 2024-05-14 - Interactive Overlay Controls Visibility
**Learning:** Container elements that wrap custom interactive controls and are hidden by default via `opacity-0` (e.g., using `group-hover:opacity-100` for hover visibility) are inaccessible to keyboard navigators because the controls remain invisible when tabbed into.
**Action:** Always pair `group-hover:opacity-100` with `focus-within:opacity-100` on the container to ensure the entire control set becomes visible when any internal interactive element receives keyboard focus.

## 2024-05-14 - Shadcn Icon-Only Buttons Accessibility
**Learning:** Using Shadcn's `<Button size="icon">` combined with Lucide icons (e.g., `<Heart />`) without additional ARIA attributes results in empty, meaningless buttons for screen reader users. Furthermore, stateful toggle buttons require dynamic labels to reflect their current purpose.
**Action:** When implementing icon-only buttons, especially toggles, always provide dynamic `aria-label` and `title` attributes (e.g., `aria-label={isLiked ? "Unlike show" : "Like show"}`). Set `aria-pressed` for stateful toggles, and add `aria-hidden="true"` to the decorative SVG/Lucide icon to prevent redundant or confusing screen reader announcements.
