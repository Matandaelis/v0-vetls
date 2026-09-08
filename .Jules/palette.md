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
## 2024-05-18 - Added ARIA labels to host product management icons
**Learning:** Found that when creating list-based UI with action buttons like in `ProductManagement`, developers frequently use generic icon-only buttons without `aria-label`s. Furthermore, even when fixing these, we must ensure dynamic strings (like `product.name`) are used to give screen readers full context of *which* item is being acted upon (e.g. "Edit Wireless Headphones" instead of just "Edit"). Additionally, sighted users benefit from these dynamic descriptions via `title` attributes that act as native tooltips.
**Action:** Always verify loop structures and available item properties (like `product.name`) before adding dynamic ARIA labels. Pair `aria-label` with `title` for tooltip support and add `aria-hidden="true"` to inner SVG/Lucide icons.
## 2024-06-21 - Custom Poll Input Accessibility
**Learning:** For custom interactive interfaces acting as mutually exclusive choices (like polls), standard div/button combinations aren't semantically meaningful enough. Screen readers need explicitly assigned standard ARIA roles to interpret these effectively.
**Action:** Always implement `role="radiogroup"` on the poll container and `role="radio"` combined with `aria-checked` on the individual option buttons to ensure proper accessibility mirroring native `<input type="radio">` components.
## 2025-03-12 - List Focus and Dynamic ARIA in Native Buttons
**Learning:** Found that when creating list-based UI with interactive elements (like liking comments in `show-sidebar.tsx`), native HTML `<button>` elements inside map loops are frequently overlooked. They often lack custom focus states (`focus-visible`), making them inaccessible to keyboard users, and they miss dynamic `aria-label`s, rendering them meaningless to screen readers without context (e.g., just saying "Like" instead of "Like comment from [User]").
**Action:** Always add custom focus states (e.g., `focus-visible:ring-2 focus-visible:ring-primary rounded`) and dynamic `aria-label`/`title` attributes to native HTML buttons used in loops to ensure full keyboard visibility and screen reader context. Hide internal icons with `aria-hidden="true"`.
## 2025-03-24 - Semantic Feedback and Keyboard Support in Star Ratings
**Learning:** Found that star rating inputs built with custom div/button combinations often lack semantic grouping and radio behavior, making them confusing for screen reader users. Additionally, relying on static component arrays to render all stars inside a single button leads to redundant SVG outputs and missing individualized selection states. Finally, they frequently lack visible focus states, rendering them unusable for keyboard navigators.
**Action:** When auditing or implementing interactive rating components, always wrap them in a `<fieldset>` with a `<legend>`. Apply `role="radiogroup"` to the container and `role="radio"` with `aria-checked` and dynamic `aria-label`s to the individual buttons. Use single, scalable SVG icons per button and ensure explicit focus styles (e.g., `focus-visible:ring-2`) are applied. Hide internal icons with `aria-hidden="true"`.

## 2023-10-27 - Product Hotspot Accessibility
**Learning:** Found that when mapping over an array of data coordinates to produce interactive native `<button>` hotspot markers on an image, the buttons were completely lacking context for screen readers and keyboard visibility. They needed to find the specific item data during the map loop to populate dynamic `aria-label`s. Furthermore, since clicking the hotspot acts as a toggle that opens a product preview popover card, it requires semantic linking via `aria-expanded` and `aria-controls` to the specific ID of the preview card container. Finally, the inner generic SVG icons within the hotspot need `aria-hidden="true"`.
**Action:** When implementing spatial mapping interfaces (like hotspots or pins) using native `<button>` tags, always perform a data lookup within the map callback to generate a dynamic `aria-label` describing the specific item the pin relates to. Apply specific focus styles (e.g. `focus-visible:ring-2`) and utilize `aria-expanded`/`aria-controls` to associate the pin with the detail popover it triggers.
## 2024-05-24 - Add accessible states to Live Chat Moderation component
**Learning:** For interactive UI elements toggling between discrete filtered states (like "All" and "Pending" buttons in the host chat moderation interface), it's important to use the `aria-pressed` attribute dynamically set by state. Also, icon-only action buttons (like "Approve" and "Delete") require an explicit `aria-label` linked to the context of the user interaction (e.g. including the user's name or target info), as well as a `title` to display standard tooltip hints. Purely decorative icons must have `aria-hidden="true"`.
**Action:** When adding or auditing lists containing filtering options or item action buttons, always ensure proper semantic links using explicit `aria-pressed` for toggles, dynamic `aria-label`s for screen readers to explain what is being acted upon, and ensure SVG icons have `aria-hidden="true"`.
