## 2024-05-24 - Interactive Rating Input Accessibility
**Learning:** When building interactive rating inputs (like star ratings), using static display component arrays (e.g., `RatingDisplay`) causes duplicate screen reader output and lacks proper semantic grouping.
**Action:** Use individual scalable SVG icons (like lucide-react's `<Star>`) with native `role='radiogroup'` and `role='radio'` attributes instead of static display component arrays to prevent duplicate screen reader output, ensure proper semantic functionality, and allow correct keyboard focus rings.

## 2024-05-24 - Interactive Rating Input Accessibility
**Learning:** When building interactive rating inputs (like star ratings), using static display component arrays (e.g., `RatingDisplay`) causes duplicate screen reader output and lacks proper semantic grouping.
**Action:** Use individual scalable SVG icons (like lucide-react's `<Star>`) with native `role='radiogroup'` and `role='radio'` attributes instead of static display component arrays to prevent duplicate screen reader output, ensure proper semantic functionality, and allow correct keyboard focus rings.
