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
## 2024-03-24 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** This app frequently uses Shadcn UI `Button` components with `size="icon"` (and raw `<button>` elements) for common actions (like, share, chat, delete, edit) across various cards and sidebars (e.g., `ClipCard`, `ShowSidebar`, `ProductManagement`, `LiveShowPlayer`). These buttons often lack `aria-label` attributes, making them inaccessible to screen readers, as the icons themselves (from `lucide-react`) do not provide descriptive text.
**Action:** Always check `Button` components with `size="icon"` or `variant="ghost"` and raw `<button>` elements containing only icons when implementing new features or reviewing existing code in this app. Add descriptive `aria-label` attributes to ensure they are accessible. When the action acts on a specific item (e.g., editing a product), include the item's name in the `aria-label` (e.g., `aria-label={\`Edit \${product.name}\`}`).
